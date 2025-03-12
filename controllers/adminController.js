const Admin = require('../models/Admin');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const bcrypt = require('bcrypt');
const moment = require('moment/moment');
const saltRounds = 10;

// Admin page
exports.admin_index = async (req, res) => {
   try {
      const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
      res.render('admin', { title: 'Admin Home Page', admin });
    } catch (error) {
      console.error("❌ Error fetching admin:", error);
      res.status(500).json({ message: '❌ Internal Server Error.' });
    }
}

// Admin logout
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

// View all reservations
exports.view_all_reservations = async (req, res) => {
  try {
    const selectedDate = req.query.date ? moment(req.query.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const displayDate = moment(selectedDate).format('MMMM Do YYYY');
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    const reservations = await Reservation.find({date: selectedDate}).lean();
  
    res.render('admin_view_res', { title: 'All Reservations', selectedDate, displayDate, admin, reservations });
  } catch (error) {
    console.error("❌ Error fetching reservations:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Add reservation page
exports.add_reservations_page = async (req, res) => {
  const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
  res.render('admin_add_res', { title: 'Add Reservation', selectedDate: req.query.date, admin});
}

// Add reservation
exports.add_reservations = async (req, res) => {
  try {
    const selectedDate = req.body.date ? moment(req.body.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const user = await User.findOne({firstName: firstName , lastName: lastName}).lean()
    const reservations = await Reservation.find({ date: selectedDate }).lean();

    const location = req.body.location;
    const time = req.body.time;
    const room = req.body.room;

    // Check if reservation already exists
    reservations.forEach(reservation => {
      if (reservation.date === selectedDate && reservation.location === location && reservation.room === room && reservation.time === time) {
        return res.status(400).send('❌ Reservation already exists.');
        // make this an alert
      }
    });

    // Create new reservation
    const newReservation = new Reservation({
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      location,
      room,
      date: selectedDate,
      time,
    });
    await newReservation.save();

    // Redirect to user reservations page
    console.log("✅ New reservation:", newReservation);
    return res.redirect(`/admin/admin_view_res?date=${selectedDate}`);
  } catch (error) {
    console.error("❌ Error adding reservation:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Delete reservation
exports.delete_reservation = async (req, res) => {
  try {
    const { id } = req.params
    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).send('❌ Reservation not found.');
    }

    console.log("✅ Reservation deleted:", deletedReservation);
    res.redirect('/admin/admin_view_res');
  } catch (error) {
    console.error("❌ Error deleting reservation:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Get admin profile
exports.get_admin = async (req, res) => {
  try {
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    res.render('admin_check_profile', { title: 'Admin Profile', admin });
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Edit admin profile
exports.edit_admin = async (req, res) => {
  try {
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    res.render('admin_edit_acc', { title: 'Edit Profile', admin });
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Update admin profile
exports.update_admin = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password } = req.body;
    const updatedAdmin = {};

    if (firstName) updatedAdmin.firstName = firstName;
    if (lastName) updatedAdmin.lastName = lastName;
    if (email) updatedAdmin.email = email;
    if (address) updatedAdmin.address = address;
    if (password) updatedAdmin.password = await bcrypt.hash(password, saltRounds);

    const admin = await Admin.findByIdAndUpdate(req.params.id, updatedAdmin, { new: true });

    if (!admin) {
      return res.status(404).send('❌ Admin not found');
    }

    // Update session data
    req.session.admin = admin;

    console.log("✅ Admin updated:", updatedAdmin);
    res.redirect(`/admin/admin_profile/${req.session.adminId}`);
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Get all users
exports.get_all_users = async (req, res) => {
  try {
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    const admins = await Admin.find().lean();
    const users = await User.find().lean();
    const reservations = await Reservation.find().lean();

    const userResCount = {};
    for (const user of users) {
      userResCount[user._id] = await Reservation.countDocuments({ userId: user._id });
    }

    const adminResCount = {};
    for (const admin of admins) {
      adminResCount[admin._id] = await Reservation.countDocuments({ adminId: admin._id });
    }

    res.render('admin_manage_acc', { title: 'Manage Accounts', admin, admins, users, reservations, userResCount, adminResCount });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Add user page
exports.add_user_page = async (req, res) => {
  const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
  res.render('admin_add_acc', { title: 'Add User', admin });
}

// Add a new user
exports.add_user = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password, admin, user } = req.body;
    const updatedAdmin = {};
    const updatedUser = {};

    if (admin) {
      if (firstname) updatedAdmin.firstName = firstName;
      if (lastName) updatedAdmin.lastName = lastName;
      if (email) updatedAdmin.email = email;
      if (address) updatedAdmin.address = address;
      if (password) updatedAdmin.password = await bcrypt.hash(password, saltRounds);

      const newAdmin = new Admin(updatedAdmin);
      await newAdmin.save();

      console.log("✅ New admin:", newAdmin);
      return res.redirect('/admin/add_manage_acc');
    } else if (user) {
      if (firstName) updatedUser.firstName = firstName;
      if (lastName) updatedUser.lastName = lastName;
      if (email) updatedUser.email = email;
      if (address) updatedUser.address = address;
      if (password) updatedUser.password = await bcrypt.hash(password, saltRounds);

      const newUser = new User(updatedUser);
      await newUser.save();

      console.log("✅ New user:", newUser);
      return res.redirect('/admin/add_manage_acc');
    }
  } catch (error) {
    console.error("❌ Error adding user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}



    