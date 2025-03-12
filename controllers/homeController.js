const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Home page
exports.home_index = async (req, res) => {
    try {
        const user = req.session.userId ? await User.findById(req.session.userId).lean() : null;
        res.render('index', { title: 'Home', user });
      } catch (error) {
        console.error(error);
        res.render('index', { title: 'Home', user: null });
      }
}

// Login page
exports.login = (req, res) => {
    if (req.session.userId) return res.redirect('/user');
    res.render('login', { title: 'Login', user: null });
}

// Register page
exports.register_get = (req, res) => {
    if (req.session.userId) return res.redirect('/user');
    res.render('register', { title: 'Register', user: null });
}

// Login user
exports.login_post = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Ensure email & password are provided
      if (!email || !password) {
        return res.status(400).send('❌ Please enter both email and password.');
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send('❌ Invalid email or password.');
      }
  
      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send('❌ Invalid email or password.');
      }
  
      // Store user ID in session
      req.session.userId = user._id;
  
      console.log("✅ User logged in:", user);
      return res.redirect('/user');  // Redirect to user dashboard
    } catch (error) {
      console.error("❌ Login error:", error);
      return res.status(500).send('❌ Internal Server Error.');
    }
  };

// Register a new user
exports.register_post = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !address || !password || !confirmPassword) {
      return res.status(400).send('❌ Please fill in all fields.');
    }

    // Ensure passwords match
    if (password !== confirmPassword) {
      return res.status(400).send('❌ Passwords do not match.');
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('❌ User already exists.');
    }

    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({ firstName, lastName, email, address, password: hashedPassword });
    await newUser.save();

    // Store user ID in session
    req.session.userId = newUser._id;

    console.log("✅ User registered successfully:", newUser);
    return res.redirect('/user');  // Redirect to user dashboard
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
};