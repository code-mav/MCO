const User = require('../models/User');
const Admin = require('../models/Admin');
const Reservation = require('../models/Reservation'); // Import Reservation model
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");
const saltRounds = 10;

// Home
exports.home_index = async (req, res) => {
    try {
        // Fetch all reservations
        const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean();

        // Check if user or admin is logged in
        let user = null;
        let admin = null;
        if (req.session.userId) {
            user = await User.findById(req.session.userId).lean();
        }
        if (req.session.adminId) {
            admin = await Admin.findById(req.session.adminId).lean();
        }

        res.render('index', { title: 'Home', user, admin, reservations });
    } catch (error) {
        console.error("❌ Error fetching reservations:", error);
        res.render('index', { title: 'Home', user: null, admin: null, reservations: [] });
    }
};

// Login page
exports.login = (req, res) => {
    if (req.session.userId) return res.redirect('/user');
    res.render('login', { title: 'Login', user: null, admin: null });
};

// Register page
exports.register_get = (req, res) => {
    if (req.session.userId) return res.redirect('/user');
    res.render('register', { title: 'Register', user: null, admin: null });
};

// Login user (AJAX)
exports.login_post = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ensure email & password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "❌ Please enter both email and password." });
        }

        // Find user by email
        const user = await User.findOne({ email });
        const admin = await Admin.findOne({ email });
        if (!user) {
            if (!admin) {
                return res.status(400).json({ error: "❌ Invalid email or password." });
            } else {
                // Compare password with hashed password
                const isMatch = await bcrypt.compare(password, admin.password);
                if (!isMatch) {
                    return res.status(400).json({ error: "❌ Invalid email or password." });
                }

                // Store admin ID in session
                req.session.adminId = admin._id;

                console.log("✅ Admin logged in:", admin);
                return res.json({ success: "✅ Login successful!", redirect: "/admin"});
            }
        } else {
            // Compare password with hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
            return res.status(400).json({ error: "❌ Invalid email or password." });
        }

        // Store user ID in session
        req.session.userId = user._id;

        console.log("✅ User logged in:", user);
        return res.json({ success: "✅ Login successful!", redirect: "/user"});
        }

    } catch (error) {
        console.error("❌ Login error:", error);
        return res.status(500).json({ error: "❌ Internal Server Error." });
    }
};

// About Page
exports.about_page = async (req, res) => {
    try {
        const packagePath = path.join(__dirname, "../package.json");

        // Read package.json file
        fs.readFile(packagePath, "utf8", async (err, data) => {
            if (err) {
                console.error("❌ Error reading package.json:", err);
                return res.render("about", { 
                    title: "About", 
                    dependencies: null, 
                    error: "Failed to load dependencies.", 
                    user: null, 
                    admin: null 
                });
            }

            try {
                // Parse dependencies
                const packageJson = JSON.parse(data);
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                // Fetch user/admin info if logged in
                let user = null;
                let admin = null;
                
                if (req.session.userId) {
                    user = await User.findById(req.session.userId).lean();
                } else if (req.session.adminId) {
                    admin = await Admin.findById(req.session.adminId).lean();
                }

                res.render("about", { 
                    title: "About", 
                    dependencies, 
                    error: null, 
                    user, 
                    admin 
                });
            } catch (parseError) {
                console.error("❌ Error parsing package.json:", parseError);
                res.render("about", { 
                    title: "About", 
                    dependencies: null, 
                    error: "Failed to parse dependencies.", 
                    user: null, 
                    admin: null 
                });
            }
        });

    } catch (error) {
        console.error("❌ About Page Error:", error);
        res.render("about", { 
            title: "About", 
            dependencies: null, 
            error: "Internal Server Error.", 
            user: null, 
            admin: null 
        });
    }
};

// Register a new user (AJAX)
exports.register_post = async (req, res) => {
    try {
        const { firstName, lastName, email, address, password, confirmPassword } = req.body;

        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !address || !password || !confirmPassword) {
            return res.status(400).json({ error: "❌ Please fill in all fields." });
        }

        // Ensure passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "❌ Passwords do not match." });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "❌ User already exists." });
        }

        // Hash password before saving to database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({ firstName, lastName, email, address, password: hashedPassword });
        await newUser.save();

        // Store user ID in session
        req.session.userId = newUser._id;

        console.log("✅ User registered successfully:", newUser);
        return res.json({ success: "✅ Registration successful!", redirect: "/user" });

    } catch (error) {
        console.error("❌ Registration error:", error);
        return res.status(500).json({ error: "❌ Internal Server Error." });
    }
};
