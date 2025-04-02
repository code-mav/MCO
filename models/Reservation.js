const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Links to User model
    userName: { type: String, required: true }, // Stores user's name for quick lookup
    location: { type: String, required: true, enum: ['1st Floor', '2nd Floor', '3rd Floor'] }, // Restricts values
    room: { type: String, required: true, enum: ['Room 1A', 'Room 1B', 'Room 2A', 'Room 2B', 'Room 3A', 'Room 3B'] }, // Valid room choices
    date: { type: String, required: true }, // Stores date as DD-MM-YYYY
    time: { type: String, required: true }, // Stores time as HH:MM-HH:MM
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Reservation', reservationSchema, 'reservations');
