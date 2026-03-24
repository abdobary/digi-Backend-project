/*
    1.require mongoose
    2.create schema
    3.create model
    4.export model
*/

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {type:String,required:true,trim:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    address: {type:String,required:false},
    role: {type:String,enum:["user","admin"],default:"user"}
}, {timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User;