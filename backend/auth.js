import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = "epilepsy_guard_secret_2024";

// Generate JWT Token
export const generateToken = (user) => {
    return jwt.sign(
        { username: user.username, role: user.role, full_name: user.full_name },
        SECRET_KEY,
        { expiresIn: "8h" }
    );
};

// Verify JWT Token Middleware
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token." });
        req.user = user;
        next();
    });
};

// Hash password
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
