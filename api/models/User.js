const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Create the User model using the updated schema
const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
