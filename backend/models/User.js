import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: {
        type: Array,
        default: []
    },
    currency: String,
    country: String,
}, {timestamps: true})      

export const User = mongoose.model('User', userSchema)