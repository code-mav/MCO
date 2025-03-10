const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Register a new user, then redirect to /user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !address || !password || !confirmPassword) {
      return res.status(400).send('Please provide all required fields.');
    }
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists.');
    }


    const hashedPassword = await bcrypt.hash(password, saltRounds);

  
    const newUser = new User({
      firstName,
      lastName,
      email,
      address,
      password: hashedPassword,
    });
    await newUser.save();

 
    req.session.userId = newUser._id;


    return res.redirect('/user');
  } catch (error) {
    return res.status(500).send('Server error: ' + error.message);
  }
};

// Login an existing user, then redirect to /user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send('Please provide email and password.');
    }

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid credentials.');
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials.');
    }


    req.session.userId = user._id;

    return res.redirect('/user');
  } catch (error) {
    return res.status(500).send('Server error: ' + error.message);
  }
};

// (Optional) These endpoints remain if you want a REST API for user CRUD
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, address, password } = req.body;
        const updatedUser = {};

        if (firstName) updatedUser.firstName = firstName;
        if (lastName) updatedUser.lastName = lastName;
        if (email) updatedUser.email = email;
        if (address) updatedUser.address = address;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedUser.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Update session data with new user details
        req.session.user = user; 
        res.redirect('/user_edit_acc');

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};


exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).send('User not found.');
      }
  
      req.session.destroy((err) => {
        if (err) console.error(err);
        return res.redirect('/');
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Server error: ' + error.message);
    }
  };
  
