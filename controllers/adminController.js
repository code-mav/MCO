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
      const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean();
      res.render('admin', { title: 'Admin Home Page', admin, reservations });
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
  const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean();
  res.render('admin_add_res', { title: 'Add Reservation', selectedDate: moment().format('YYYY-MM-DD'), admin, reservations});
}

// Add reservation
exports.add_reservations = async (req, res) => {
  try {
    const selectedDate = req.body.date ? moment(req.body.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const user = await User.findOne({firstName: firstName , lastName: lastName}).lean()

    const location = req.body.location;
    const time = req.body.time;
    const room = req.body.room;

    if (!user) {
      return res.status(400).json({error: '❌ User not found.'});
    }

    if (!selectedDate || !firstName || !lastName || !location || !time || !room) {
      return res.status(400).json({error: '❌ Please fill in all fields.'});
    }

    // Check if reservation already exists
    const existingReservation = await Reservation.findOne({ location, room, date: selectedDate, time });
    if (existingReservation) {
      return res.status(400).json({error: '❌ This reservation is already reserved.'});
    }

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
    return res.json({ success: '✅ Reservation added successfully.' });
  } catch (error) {
    console.error("❌ Error adding reservation:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Edit reservation page
exports.edit_reservation_page = async (req, res) => {
  try {
    const selectedDate = req.query.date ? moment(req.query.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const displayDate = moment(selectedDate).format('MMMM Do YYYY');
    const { id } = req.params;
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    const reservations = await Reservation.find().sort({ date: 1, time: 1 }).lean();
    const reservation = await Reservation.findById(id).lean();

    const user = await User.findById(reservation.userId).lean();

    if (!reservation) {
      return res.status(404).send('❌ Reservation not found.');
    }

    res.render('admin_edit_res', { title: 'Edit Reservation', admin, user, selectedDate, displayDate, reservations, reservation });
  } catch (error) {
    console.error("❌ Error fetching reservation:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
};

// Update reservation
exports.update_reservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, room, date, time } = req.body;
    const updatedReservation = { location, room, date, time };
    const reservation = await Reservation.findById(id).lean();

    if (!location || !room || !time || !date) {
      return res.status(400).json({ error: "❌ Please fill in all fields." });
    }

    if (!reservation) {
      return res.status(404).send('❌ Reservation not found.');
    }

    // Check if reservation already exists
    const existingReservation = await Reservation.findOne({ location, room, date, time });
    if (existingReservation) {
      return res.status(400).json({ error: "❌ This reservation is already reserved." });
    }
    
    const new_reservation = await Reservation.findByIdAndUpdate(id, updatedReservation, { new: true });
    
    await new_reservation.save();
    console.log("✅ Reservation updated:", updatedReservation);
    return res.json({ success: '✅ Reservation updated successfully.' });
  } catch (error) {
    console.error("❌ Error updating reservation:", error);
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
    res.render('admin_edit_acc', { title: 'Edit Profile', admin, otherAdmin: admin });
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
    if (password && password.length > 0) updatedAdmin.password = await bcrypt.hash(password, saltRounds);

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

// Edit other admin profile
exports.edit_other_admin = async (req, res) => {
  try {
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    const otherAdmin = await Admin.findById(req.params.id).lean();
    res.render('admin_edit_acc', { title: 'Edit Profile', admin, otherAdmin, user: null });
  } catch (error) {
    console.error("❌ Error fetching admin:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Update other admin profile
exports.update_other_admin = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password } = req.body;
    const updatedAdmin = {};

    if (firstName) updatedAdmin.firstName = firstName;
    if (lastName) updatedAdmin.lastName = lastName;
    if (email) updatedAdmin.email = email;
    if (address) updatedAdmin.address = address;
    if (password && password.length > 0) updatedAdmin.password = await bcrypt.hash(password, saltRounds);

    const admin = await Admin.findByIdAndUpdate(req.params.id, updatedAdmin, { new: true });

    if (!admin) {
      return res.status(404).send('❌ Admin not found');
    }

    console.log("✅ Admin updated:", updatedAdmin);
    res.redirect(`/admin/admin_manage_acc`);
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Delete admin
exports.delete_admin = async (req, res) => {
  try {
    const { id } = req.params
    const deletedAdmin = await Admin.findByIdAndDelete(id);

    // Delete all reservations associated with the user
    await Reservation.deleteMany({ userId: id });

    if (!deletedAdmin) {
      return res.status(404).send('❌ Admin not found.');
    }

    console.log("✅ Admin deleted:", deletedAdmin);
    res.redirect('/admin/admin_manage_acc');
  } catch (error) {
    console.error("❌ Error deleting admin:", error);
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

    console.log(admin, user);

    if (admin) {
      if (firstName) updatedAdmin.firstName = firstName;
      if (lastName) updatedAdmin.lastName = lastName;
      if (email) updatedAdmin.email = email;
      if (address) updatedAdmin.address = address;
      if (password) updatedAdmin.password = await bcrypt.hash(password, saltRounds);

      const newAdmin = new Admin(updatedAdmin);
      await newAdmin.save();

      console.log("✅ New admin:", newAdmin);
      return res.redirect('/admin/admin_manage_acc');
    } else if (user) {
      if (firstName) updatedUser.firstName = firstName;
      if (lastName) updatedUser.lastName = lastName;
      if (email) updatedUser.email = email;
      if (address) updatedUser.address = address;
      if (password) updatedUser.password = await bcrypt.hash(password, saltRounds);

      const newUser = new User(updatedUser);
      await newUser.save();

      console.log("✅ New user:", newUser);
      return res.redirect('/admin/admin_manage_acc');
    }
  } catch (error) {
    console.error("❌ Error adding user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Edit user page
exports.edit_user_page = async (req, res) => {
  try {
    const admin = req.session.adminId ? await Admin.findById(req.session.adminId).lean() : null;
    const user = await User.findById(req.params.id).lean();
    res.render('admin_edit_acc', { title: 'Edit Profile', admin, otherAdmin: null, user });
  }
  catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Update user
exports.update_user = async (req, res) => {
  try {
    const { firstName, lastName, email, address, password } = req.body;
    const updatedUser = {};

    if (firstName) updatedUser.firstName = firstName;
    if (lastName) updatedUser.lastName = lastName;
    if (email) updatedUser.email = email;
    if (address) updatedUser.address = address;
    if (password) updatedUser.password = await bcrypt.hash(password, saltRounds);

    const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true });

    if (!user) {
      return res.status(404).send('❌ User not found.');
    }

    console.log("✅ User updated:", updatedUser);
    res.redirect(`/admin/admin_manage_acc`);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}

// Delete user
exports.delete_user = async (req, res) => {
  try {
    const { id } = req.params
    const deletedUser = await User.findByIdAndDelete(id);

    // Delete all reservations associated with the user
    await Reservation.deleteMany({ userId: id });

    if (!deletedUser) {
      return res.status(404).send('❌ User not found.');
    }

    console.log("✅ User deleted:", deletedUser);
    res.redirect('/admin/admin_manage_acc');
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).send('❌ Internal Server Error.');
  }
}