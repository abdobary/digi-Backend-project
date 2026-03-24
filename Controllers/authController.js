/*
REGISTER CONTROLLER PROCESS:                                                LOGIN CONTROLLER PROCESS:

1. VALIDATION                                                               1. VALIDATION
   - Validate request body using Joi schema                                     - Validate request body using Joi schema
   - If validation fails → send 400 error                                       - If validation fails → send 400 error

2. DATABASE CHECK                                                           2. FIND USER
   - Check if user already exists (by email OR username)                        - Check if user exists by email in database
   - If user exists → send 409 conflict error                                   - If user not found → send 401 unauthorized error

3. PASSWORD HASHING                                                         3. VERIFY PASSWORD
   - Generate salt                                                              - Compare provided password with stored hash
   - Hash password with bcrypt                                                  - If password incorrect → send 401 unauthorized error

4. CREATE USER                                                              4. GENERATE TOKEN
   - Create new user document in database                                       - Create JWT token with user data
   - Save to MongoDB                                                            - Token expires in 7 days

5. GENERATE TOKEN                                                           5. PREPARE RESPONSE
   - Create JWT token with user data                                            - Remove password from user object
   - Token expires in 7 days                                                    - Send 200 success response with token and user data

6. PREPARE RESPONSE                                                         6. ERROR HANDLING
   - Remove password from user object                                           - If anything fails → catch error and send 500 server error
   - Send 201 success response with token and user data

7. ERROR HANDLING
   - If anything fails → catch error and send 500 server error
*/

const User = require("../models/User")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema} = require('../Controllers/Validation/authValidation.js');

/****************************************************************************************************/
/****************************************************************************************************/
const registerController = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body, {
            abortEarly: false,  // return all errors in (error)
            stripUnknown: true  // return value which is the body
        });

        if (error) {
            return res.status(400).json({ // stop by return word and send response
                /*      A 400 Bad Request response means the server cannot process the request due to a client-side error, 
                        such as malformed syntax, invalid data, or incorrect request formatting.       */
                msg: error.details.map((err) => err.message)
            });
        }

        const { username, email, password, role } = value;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
            /*
                Outer object: { $or: [...] }
                    $or is a MongoDB logical operator
                    It means: match documents that satisfy AT LEAST ONE of the conditions in the array
                    Returns true if any of the conditions are true
            */
        });

        if (existingUser) {
            return res.status(409).json({   
                // the server cannot process the request due to a conflict with the current state of the target resource.
                // no need to register cuz already did before so use return to stop and send response
                msg: existingUser.email === email
                    ? "Email already registered"
                    : "Username already taken"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10); 
        // A salt is a random string of characters that gets added to a password before hashing
        //The cost factor (e.g., 10) controls hashing strength by setting rounds as 
        //2^cost, where higher values increase security but slow performance. "$2b$10$N9qo8uLOickgx2ZMRZoMyM"
        const hashedPassword = await bcrypt.hash(password, salt);
        //Combine: Salt + Password are combined
        // Example hashed password: "$2b$10$N9qo8uLOickgx2ZMRZoMyM.zFz2D5K.pUqZRvUYvJ7QpV7vqWqKqG"

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user' // Default role if not provided
        });

        await user.save(); // save the user and wait until it finishes

        // Generate JWT token
        const token = jwt.sign( // jwt is commonly used for authentication and authorization.
            { userId: user._id, email: user.email, role: user.role }, // payload
            process.env.JWT_SECRET, // secret key
            { expiresIn: '7d' } // expires in 7 days
            /*
            .sign() method
                Creates (signs) a new JWT token
                Takes three parameters: payload, secret, and options
                Returns a string token that looks like: 
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
                    .eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0
                    .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
            */

            /*
                // ❌ BAD - Never store sensitive information
                { userId: user._id, password: user.password, creditCard: user.creditCard }
                // ❌ BAD - Too much data makes token huge
                { ...user.toObject() } // Don't store entire user document
            */
        );

        // Remove password from response
        const userResponse = user.toObject();
        /*
            .toObject():
                Converts the Mongoose document to a plain JavaScript object
                Removes all Mongoose-specific methods and metadata
                Makes the object mutable and easier to manipulate
        */
        delete userResponse.password; // Removes the password property from the object
        //Because if hackers steal the password hash, they can crack it and break into user accounts.

        return res.status(201).json({ // finally we registered the user send the response 201
            // 201 = the server successfully fulfilled a request by creating a new resource
            msg: "User registered successfully",
            token,
            user: userResponse
        });

    } catch (error) { // if crashed print the error and send response 500 which means bad code
        /*     The 500 Internal Server Error is a generic HTTP status code indicating that the server 
               encountered an unexpected condition that prevented it from fulfilling the request.       */
        console.log(error);
        return res.status(500).json({
            msg: "Internal server error",
            error: error.message
        });
    }
};
/****************************************************************************************************/
/****************************************************************************************************/

/****************************************************************************************************/
/****************************************************************************************************/
const loginController = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                msg: error.details.map((err) => err.message)
            });
        }

        const { email, password } = value;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                msg: "Invalid email or password"
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                msg: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            msg: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Internal server error",
            error: error.message
        });
    }
};
/****************************************************************************************************/
/****************************************************************************************************/

module.exports = { registerController, loginController };