const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  reminderDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
