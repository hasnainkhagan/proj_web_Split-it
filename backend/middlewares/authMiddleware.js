import jwt from "jsonwebtoken"

export function verifyToken(req, res, next) {
    try {
        const header = req.headers['authorization'];

        const token = header.split('Bearer ')[1]
        if (!token) return res.status(401).json({ auth: false, message: 'No Token Provided.' })

        const data = jwt.verify(token, process.env.JWT_SECRET);
        if (!data) return res.status(401).json({success: false, message: "Invalid Token"});

        req.data = {
            email: data.email
        }

        next();

    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }
}

export function signToken(req, res, next) {
    try {
        const token = jwt.sign({
            email: req.body.email,
            createdAt: new Date(Date.now())
        }, process.env.JWT_SECRET, {expiresIn: 30 * 24 * 60 * 60})
        
        req.token = token

        next()
    } catch (error) {
        return res.status(500).json("Error while signing the token")
    }
}

