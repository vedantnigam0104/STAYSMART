const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  avatar: { type: String ,default: 'default_avatar_base64_string'} // Add the avatar field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
