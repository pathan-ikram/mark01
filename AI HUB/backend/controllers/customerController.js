const db = require("../config/database");

// GET all customers
exports.getCustomers = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM customers ORDER BY id DESC"
        );

        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Database Error"
        });
    }
};

// ADD customer
exports.addCustomer = async (req, res) => {

    try {

        const {
            full_name,
            mobile,
            aadhaar,
            dob,
            father_name,
            caste,
            email,
            village,
            address
        } = req.body;

        await db.query(

            `INSERT INTO customers
            (
                full_name,
                mobile,
                aadhaar,
                dob,
                father_name,
                caste,
                email,
                village,
                address
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name,
                mobile,
                aadhaar,
                dob,
                father_name,
                caste,
                email,
                village,
                address
            ]
        );

        res.json({
            success: true,
            message: "Customer Saved"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Database Error"
        });

    }

};