import mongoose from "mongoose";

const billSchema = new mongoose.Schema({
    ownerDetails: {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: Number,
            required: true,
        }
    },
    billDetails: {
        billNumber: {
            type: String,
            required: true,
        },
        billAmount: {
            type: Number,
            required: true,
        },
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        }
    },
    confirmations: {
        type: Array,
        default: []
    },
    splitters: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: "pending"
    },
    expiry: String,
}, { timestamps: true })

export const Bill = mongoose.model('bill', billSchema)



// Splitters

// {
//     username: String,
//     email: String,
//     phone: Number,
//     percent: Number,
//     notifyCount: Number,
//     status: String, --> 'pending' or 'paid' or 'declined'
//     splitAt: String,
//     lastDate: String,
// }

// Confirmations

// {
//     username: String,
//     email: String,
//     phone: Number,
//     percent: Number,
//     proofImages: [String],
//     proofLink: String,
//     note: String || '',
//     status: String, --> 'pending' or 'accepted' or 'declined'
//     paidAt: String,
// }