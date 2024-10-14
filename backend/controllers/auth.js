import bcrypt from 'bcrypt'
import cron from 'node-cron'
import nodemailer from 'nodemailer';

// User Model
import { User } from '../models/user.js';
import { client } from '../client.js';

export async function signUp(req, res) {
    const { username, email, phoneNumber, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
    })

    try {
        const userConflict = await User.find({
            $or: [
                { email },
                { username },
                { phoneNumber }
            ]
        });

        if (userConflict) {
            if (userConflict.phoneNumber === phoneNumber) {
                return res.status(409).json({ error: "Phone number already exists, try with a different one.", success: false });
            }
            if (userConflict.username === username) {
                return res.status(409).json({ error: "Username already exists, try with a different one.", success: false });
            }
            if (userConflict.email === email) {
                return res.status(409).json({ error: 'Email has been used', success: false });
            }
        }

        await newUser.save();

        return res.status(200).json({ success: true, message: "Successfully registered, you can now login!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function logIn(req, res) {
    const { email, password } = req.body;

    try {
        await User.findOne({ email }).then(async (foundUser) => {
            if (!foundUser) return res.status(409).json({ error: 'Invalid Credentials, try register yourself!', success: false });

            const comparePassword = await bcrypt.compare(password, foundUser.password);

            if (!comparePassword) {
                return res.status(401).json({ error: "Invalid Credentials", success: false })
            } else {

                const token = req.token;

                foundUser.tokens.push({
                    token,
                    createdAt: new Date()
                });

                await foundUser.save();
                return res.status(200).json({ token, success: true, message: "Successfully Logged In!" });
            }
        })

    } catch (err) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function getUserData(req, res) {
    const email = req.data.email

    try {
        await User.findOne({ email }).then((foundUser) => {
            if (!foundUser) return res.status(404).json({ success: false, error: "User not found" })

            return res.status(200).json({ success: true, data: foundUser })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function requestResetPassword(req, res) {
    const { email } = req.body;

    try {
        const sessionToken = `${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}-${Math.floor(Math.random() * 9999)}`

        await client.SET(`users:${email}:session`, sessionToken, { EX: 600 });

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
            from: "'Split It' <no-reply@ohana.com>",
            to: email,
            subject: "Password Reset Request for Your Split It Account",
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your Split It account. If you made this request, please click the button below to reset your password.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <a href="https://your-app-url.com/reset-password?token=${sessionToken}&email=${email}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                       Reset Password
                    </a>
                    <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                    <p>https://your-app-url.com/reset-password?token=${sessionToken}&email=${email}</p>
                    <p>Thank you,<br> The Split It Team</p>
                </div>
            `
        };


        await transporter.sendMail(message);

        return res.status(200).json({ success: true, message: "Email sent!" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function verifySessionToken(req, res) {
    const { sessionToken, email } = req.body;

    try {
        const isSessionExist = await client.GET(`users:${email}:session`) === sessionToken;
        console.log(isSessionExist)
        if (!isSessionExist) {
            return res.status(401).json({ success: false, error: "Session token is expired!" });
        }

        return res.status(200).json({ success: true, message: 'Authentic' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function changePassword(req, res) {
    const { sessionToken, email, password } = req.body;

    try {
        const isSessionExist = await client.GET(`users:${email}:session`) === sessionToken;
        console.log(isSessionExist)
        if (!isSessionExist) {
            return res.status(401).json({ success: false, error: "Session token is expired!" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    password: hashedPassword
                }
            },
            { new: true }
        )

        return res.status(200).json({ success: true, message: 'Password changed' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function changeUsername(req, res) {
    const { email } = req.data
    const { username } = req.body;

    try {
        const userPrevData = await User.findOne({ email });

        if (userPrevData.username === username) {
            return res.status(200).json({ success: true, message: 'Username is the same as the previous one, try with a different one.' });
        } else {
            const isUsernameExisted = await User.findOne({ username });

            if (isUsernameExisted) {
                return res.status(400).json({ success: false, error: "Username is already taken" })
            } else {
                await User.findOneAndUpdate(
                    { email },
                    {
                        $set: {
                            username
                        }
                    },
                    { new: true }
                )
                return res.status(200).json({ success: true, message: `Username changed` })
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function changeEmail(req, res) {
    const prevEmail = req.data.email;
    const { email } = req.body;

    try {
        const userPrevData = await User.findOne({ email: prevEmail });

        if (userPrevData.email === email) {
            return res.status(200).json({ success: true, message: 'Email is the same as the previous one, try with a different one.' });
        } else {
            const isEmailExisted = await User.findOne({ email });

            if (isEmailExisted) {
                return res.status(400).json({ success: false, error: "Email is already taken" })
            } else {
                await User.findOneAndUpdate({ prevEmail }).then(async (foundUser) => {
                    foundUser.email = email;
                    const token = req.token;

                    foundUser.tokens.push({
                        token,
                        createdAt: new Date()
                    });

                    await foundUser.save();
                    return res.status(200).json({ success: true, message: `Email changed` })
                })
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

const TOKEN_EXPIRATION_DAYS = 30;

function isTokenExpired(createdAt) {
    const createdDate = new Date(createdAt);
    const expirationDate = new Date(createdDate);
    expirationDate.setDate(createdDate.getDate() + TOKEN_EXPIRATION_DAYS);
    return expirationDate < new Date();
}

cron.schedule('0 0 * * *', async () => {
    console.log('Running the token cleanup task...');

    try {
        const users = await User.find();

        for (const user of users) {
            const validTokens = user.tokens.filter(t => !isTokenExpired(t.createdAt.$date));

            if (validTokens.length !== user.tokens.length) {
                user.tokens = validTokens;
                await user.save();
                console.log(`Expired tokens removed for user: ${user.email}`);
            }
        }

    } catch (err) {
        console.error('Error during token cleanup:', err);
    }
});