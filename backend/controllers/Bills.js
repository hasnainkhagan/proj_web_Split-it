import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Bill } from "../models/Bill.js"

export async function myBills(req, res) {
    const { page, limit = 10 } = req.query;
    const { email } = req.data;

    try {
        const bills = await Bill
            .find({ ownerDetails: { email } })
            .select("billDetails status expiry createdAt")
            .sort({ createdAt: -1 })
            .skip(limit * (page - 1))
            .limit(limit)

        const totalBills = await Bill.countDocuments({ ownerDetails: { email } });

        res.status(200).json({
            bills,
            totalBills,
        })
    } catch (error) {
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}