const User = require('../models/User');
const Reservation = require('../models/Reservation');
const bcrypt = require('bcrypt');
const moment = require('moment/moment');
const saltRounds = 10;

// User home page with global reservations
exports.user_index = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean(); // Fetch all reservations

    res.render('user', { title: 'User Home Page', user, reservations });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: '❌ Internal Server Error.' });
  }
};

// User logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error destroying session:", err);
      return res.status(500).send('❌ Internal Server Error.');
    }
    console.log("✅ Session destroyed successfully.");
    res.redirect('/');
  });
};

// View user reservations
exports.view_reservations = async (req, res) => {
  try {
    const selectedDate = req.query.date ? moment(req.query.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const displayDate = moment(selectedDate).format('MMMM Do YYYY');
    const user = req.session.userId ? await User.findById(req.session.userId).lean() : null;

    // ✅ Fetch reservations for selected date
    const reservations = await Reservation.find({ userId: user._id, date: selectedDate }).lean();

    res.render('user_view_res', { title: 'My Reservations', selectedDate, displayDate, user, reservations });
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Add reservations page
exports.add_reservations_page = async (req, res) => {
  try {
    const user = req.session.userId ? await User.findById(req.session.userId).lean() : null;
    const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean();

    res.render('user_add_res', {
      title: 'Add Reservation',
      selectedDate: moment().format('YYYY-MM-DD'),
      user,
      reservations, // ✅ Pass reservations to EJS
      moment
    });
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Add reservations
exports.add_reservations = async (req, res) => {
  try {
    const { location, room, time, date } = req.body;

    if (!location || !room || !time || !date) {
      return res.status(400).json({ error: "❌ Please fill in all fields." });
    }

    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.status(401).json({ error: "❌ Unauthorized." });
<<<<<<< HEAD

    // ✅ Check if reservation already exists
    const existingReservation = await Reservation.findOne({ location, room, date, time });
    if (existingReservation) {
      return res.status(400).json({ error: "❌ This time slot is already reserved." });
    }

=======

    // ✅ Check if reservation already exists
    const existingReservation = await Reservation.findOne({ location, room, date, time });
    if (existingReservation) {
      return res.status(400).json({ error: "❌ This time slot is already reserved." });
    }

>>>>>>> 155810be57b96c379f49caf64aa1218710b63797
    // ✅ Create new reservation
    const newReservation = new Reservation({
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      location,
      room,
      date,
      time,
    });

    await newReservation.save();
    console.log("✅ New reservation:", newReservation);

    return res.json({ success: "✅ Reservation added successfully!" });

  } catch (error) {
    console.error("❌ Error adding reservation:", error);
    return res.status(500).json({ error: "❌ Internal Server Error." });
  }
};

// Delete reservation
exports.delete_reservation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).send('❌ Reservation not found.');
    }

    console.log("✅ Reservation deleted successfully.");
    res.redirect('/user/user_view_res');
  } catch (error) {
    console.error("❌ Error deleting reservation:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
}

// Get user
exports.get_user = async (req, res) => {
  try {
    const user = req.session.userId ? await User.findById(req.session.userId) : null;
    res.render('user_check_profile', { title: 'User Profile', user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: '❌ Internal Server Error.' });
  }
};

// Edit user profile
exports.edit_user = async (req, res) => {
  try {
    const user = req.session.userId ? await User.findById(req.session.userId).lean() : null;
    res.render('user_edit_acc', { title: 'Edit Profile', user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Update user profile
exports.update_user = async (req, res) => {
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
    res.redirect(`/user/profile/${user._id}`);  // Redirect after update
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).send("❌ Internal Server Error.");
  }
};

// Delete user
exports.delete_user = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).send('❌ User not found.');
    }

    // Delete all reservations associated with the user
    await Reservation.deleteMany({ userId: id });

    // ✅ Destroy session on user deletion
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Session destroy error:", err);
        return res.status(500).send('❌ Internal Server Error.');
      }

      console.log("✅ User deleted successfully.");
      res.redirect('/');
    });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return res.status(500).send('❌ Internal Server Error.');
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 155810be57b96c379f49caf64aa1218710b63797
