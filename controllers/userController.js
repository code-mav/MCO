const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 📌 Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password, confirmPassword } = req.body;

    // ✅ Check if all required fields are provided
    if (!firstName || !lastName || !email || !address || !password || !confirmPassword) {
      return res.status(400).send('❌ Please fill in all fields.');
    }

    // ✅ Ensure passwords match
    if (password !== confirmPassword) {
      return res.status(400).send('❌ Passwords do not match.');
    }

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('❌ User already exists.');
    }

    // ✅ Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ✅ Create new user
    const newUser = new User({ firstName, lastName, email, address, password: hashedPassword });
    await newUser.save();

    // ✅ Store user ID in session
    req.session.userId = newUser._id;

    console.log("✅ User registered successfully:", newUser);
    return res.redirect('/user');  // Redirect to user dashboard
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
};

// 📌 Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Ensure email & password are provided
    if (!email || !password) {
      return res.status(400).send('❌ Please enter both email and password.');
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('❌ Invalid email or password.');
    }

    // ✅ Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('❌ Invalid email or password.');
    }

    // ✅ Store user ID in session
    req.session.userId = user._id;

    console.log("✅ User logged in:", user);
    return res.redirect('/user');  // Redirect to user dashboard
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
};

// 📌 Logout user
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).send('❌ Internal Server Error.');
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
};

// 📌 Get user by ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: '❌ User not found.' });
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: '❌ Internal Server Error.' });
  }
};

// 📌 Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password } = req.body;
    const updatedUser = {};

    if (firstName) updatedUser.firstName = firstName;
    if (lastName) updatedUser.lastName = lastName;
    if (email) updatedUser.email = email;
    if (address) updatedUser.address = address;

    // ✅ Hash password before updating (if provided)
    if (password) {
      updatedUser.password = await bcrypt.hash(password, saltRounds);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true });

    if (!user) {
      return res.status(404).send("❌ User not found.");
    }

    // ✅ Update session data
    req.session.user = user; 
    res.redirect('/user_edit_acc');  // Redirect after update
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).send("❌ Internal Server Error.");
  }
};

// 📌 Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).send('❌ User not found.');
    }

    // ✅ Destroy session on user deletion
    req.session.destroy((err) => {
      if (err) console.error("❌ Session destroy error:", err);
      res.status(500).send('❌ Internal Server Error.');
    });

    console.log("✅ User deleted successfully.");
    res.redirect('/');
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
};
