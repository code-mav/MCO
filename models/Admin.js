const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    address:   { type: String, required: true },
    password:  { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema, 'admins');
