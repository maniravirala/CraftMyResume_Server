const User = require('../models/userModel');

// Deduct credit 
const deductCredit = async ({ mail }) => {
    try {
        const user = await User.findOne({ email: mail });
        if (!user) return { status: 'fail', message: 'User not found' }

        if (user.credits < 1) return { status: 'fail', message: 'Insufficient credits' };

        user.credits -= 1;
        await user.save();
        return { status: 'success', message: 'Credit deducted successfully' };
    } catch (error) {
        return { status: 'fail', message: error.message };
    }
}

// Add credit
const addCredit = async ({ referralCode }) => {
    try {
        const user = await User.findOne({ code: referralCode });
        if (!user) return { status: 'fail', message: 'Invalid referral code' };

        user.credits += 1;        
        await user.save();
        return { status: 'success', message: 'Credit added successfully' };
    } catch (error) {
        return { status: 'fail', message: error.message };
    }
}

module.exports = { deductCredit, addCredit };
