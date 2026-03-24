/*
    1.require joi
    2.create schema
    3.export
*/

const joi=require("joi")

const registerSchema = joi.object({
    username: joi.string().required().min(4).max(20),
    email: joi.string().required().email(),
    address: joi.string(),
    password: joi.string().required().min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')),
    role: joi.string().valid("user","admin").default("user")
})

const loginSchema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().required().min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
})

module.exports={registerSchema,loginSchema}