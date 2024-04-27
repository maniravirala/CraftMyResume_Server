const User = require('../models/userModel');
const createError = require('../utils/appError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const referralCodeGenerator = require('referral-code-generator');
require('dotenv').config();

const { deductCredit, addCredit } = require('./creditsController');

// Register
exports.register = async (req, res, next) => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return next(new createError(400, 'User already exists'));

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    if (req.body.referralCode && req.body.referralCode.length > 0) {
      let response = await addCredit({ referralCode: req.body.referralCode });
      if (response.status === 'fail') return next(new createError(400, response.message));
    }

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      code: referralCodeGenerator.alphaNumeric('uppercase', 4, 2)
    });

    if (req.body.referralCode && req.body.referralCode.length > 0) {
      let referrer = await User.findOne({ code: req.body.referralCode });
      referrer.referredUsers.push(newUser._id);
      await referrer.save();
    }

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('access_token', token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: 'None'
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      }
    });
  } catch (error) {
    return next(new createError(400, error.message));
  }
}

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new createError(401, 'User not found'));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new createError(401, 'Invalid password'));

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('access_token', token, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: 'None'
    });


    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(new createError(400, error.message));
  }
}

// Logout
exports.logout = (req, res) => {
  res.clearCookie('access_token', {
    secure: true,
    sameSite: 'None'
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
}
