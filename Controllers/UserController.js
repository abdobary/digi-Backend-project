const User = require("../models/User");
const bcrypt = require('bcrypt');

const userCont = (app) => {
    //-------------------------------------------------------
    app.get('/api/email/:email', async (req, res) => {
        try {
            const { email } = req.params;

            // Find user by email
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            next(error);
        }
    });

    //-------------------------------------------------------
    app.put('/api/edit-user/:email', async (req, res) => {
        try {
            const { email } = req.params;
            const { username, address, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Update fields
            if (username) user.username = username;
            if (address !== undefined) user.address = address;

            // Update password if provided
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            await user.save();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    username: user.username,
                    email: user.email,
                    address: user.address
                }
            });

        } catch (error) {
            next(error);
        }
    });

    //-------------------------------------------------------
    // Verify password endpoint
    app.post('/api/verify-password', async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            res.json({ message: 'Password verified' });

        } catch (error) {
            next(error);
        }
    });
}

module.exports = { userCont };