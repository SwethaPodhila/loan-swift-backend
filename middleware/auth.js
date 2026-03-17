const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    // 🔥 FIX HERE
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};
