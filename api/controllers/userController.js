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
    if (userExists) return next(new createError('User already exists', 400));

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    if (req.body.referralCode && req.body.referralCode.length > 0) {
      let response = await addCredit({ referralCode: req.body.referralCode });
      if (response.status === 'fail') return next(new createError(response.message, 400));
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

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        code: newUser.code,
      }
    });
  } catch (error) {
    return next(new createError(error.message, 400));
  }
}

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new createError('Invalid email', 401));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new createError('Invalid password', 401));

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
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
    return next(new createError(error.message, 400));
  }
}

