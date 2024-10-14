import { client } from "../client.js";
import nodemailer from 'nodemailer';

export async function generateOtp(req, res) {
    let { email } = req.body

    await client.set(`Users:${email}:otp`, Math.floor(1000 + Math.random() * 9000), { EX: 300 });
    const otp = await client.get(`Users:${email}:otp`)

    try {
        const emailConfig = {
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        const transporter = nodemailer.createTransport(emailConfig);

        const message = {
            from: "'Split It' <no-reply@gmail.com>",
            to: email,
            subject: "Otp - Split It",
            html: `Your OTP is: ${otp}`
        };

        await transporter.sendMail(message);

        return res.status(200).json({ message: `OTP Sent!`, success: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function checkOtp(req, res) {
    let { email, otp } = req.body

    try {
        const checkOtp = await client.get(`Users:${email}:otp`)

        if (!checkOtp || checkOtp === null) {
            return res.status(401).json({ error: "OTP Expired!, Generate a new one", success: false })
        } else {
            if (otp === checkOtp) {
                res.status(401).json({ message: `${otp}, This OTP is correct!`, success: false });
            } else {
                res.status(401).json({ error: "Wrong OTP entered!", success: false });
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}