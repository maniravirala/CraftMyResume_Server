const User = require('../models/userModel');
const createError = require('../utils/appError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const newLocal = 'referral-code-generator';
const referralCodeGenerator = require(newLocal);
const nodemailer = require('nodemailer');
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

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new createError(404, 'User not found'));

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10m'
    });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth
        : {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Password Reset',
      html: `
        <h2>Please click on the link below to reset your password</h2>
        <p>${process.env.WEB_URL}/reset-password/${user._id}/${token}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email'
    });
  }
  catch (error) {
    return next(new createError(400, error.message));
  }
}

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) return next(new createError(400, 'Invalid token'));

    if (user.resetPasswordExpires < Date.now()) return next(new createError(400, 'Token expired'));

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully'
    });
  }
  catch (error) {
    return next(new createError(400, error.message));
  }
}