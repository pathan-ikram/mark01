const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==============================
// SIGNUP
// ==============================

exports.signup = async (req, res) => {

    try {

        const {
            fullname,
            username,
            email,
            password,
            phone,
            country
        } = req.body;

        // Check required fields
        if (
            !fullname ||
            !username ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        // Check email
        const [emailExists] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (emailExists.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });

        }

        // Check username
        const [userExists] = await db.query(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (userExists.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Username already exists."
            });

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.query(

            `INSERT INTO users
            (
                fullname,
                username,
                email,
                password,
                phone,
                country
            )

            VALUES (?, ?, ?, ?, ?, ?)`,

            [
                fullname,
                username,
                email,
                hashedPassword,
                phone,
                country
            ]

        );

        res.status(201).json({

            success: true,
            message: "Account created successfully."

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};



// ==============================
// LOGIN
// ==============================


    exports.login = async (req, res) => {

console.log("LOGIN REQUEST RECEIVED");
    console.log(req.body);

    try {

        const {

            email,
            password

        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and password required."

            });

        }

        const [rows] = await db.query(

            "SELECT * FROM users WHERE email=?",

            [email]

        );

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,
                message: "User not found."

            });

        }

        const user = rows[0];

        const match = await bcrypt.compare(

            password,
            user.password

        );

        if (!match) {

            return res.status(401).json({

                success: false,
                message: "Incorrect password."

            });

        }

        const token = jwt.sign(

            {

                id: user.id,
                email: user.email,
                role: user.role

            },

            process.env.JWT_SECRET || "AIHUB_SECRET",

            {

                expiresIn: "7d"

            }

        );

        res.json({

            success: true,

            token,

            user: {

                id: user.id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role,
                subscription: user.subscription

            }

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};
