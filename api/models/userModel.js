const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
var userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  password: {
    type: String
  },
  referralCode: {
    type: String
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  credits: {
    type: Number,
    default: 3
  },
  referredUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  created: {
    type: Date,
    default: Date.now
  }
});

// UserSchema.methods.comparePassword = function (password) {
//   return bcrypt.compareSync(password, this.hash_password);
// };

const User = mongoose.model('User', userSchema);
module.exports = User;