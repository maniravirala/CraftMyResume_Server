const { ProfilePicture } = require('../models/profileDataModel');
const createError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');
const imagekit = require('../utils/imagekit');

// exports.updateProfilePicture = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             return next(createError('Please upload a file', 400));
//         }
//         cloudinary.uploader.upload(req.file.path, async (err, result) => {
//             if (err) {
//                 return next(createError(err.message, 400));
//             }

//             const user = await ProfilePicture.findOne({ user: req.params.userId });
//             if (!user) {
//                 const profilePicture = new ProfilePicture({
//                     user: req.params.userId,
//                     profilePicture: result.secure_url,
//                     cloudinaryId: result.public_id
//                 });
//                 await profilePicture.save();
//             } else {
//                 await cloudinary.uploader.destroy(user.cloudinaryId);
//                 user.profilePicture = result.secure_url;
//                 user.cloudinaryId = result.public_id;
//                 await user.save();
//             }
//                 res.status(200).json({
//                     success: true,
//                     message: 'Profile picture updated successfully',
//                     data: {
//                         user: req.params.userId,
//                         profilePicture: result.secure_url,
//                         cloudinaryId: result.public_id
//                     }
//                 });
//             });

//     } catch (error) {
//         next(createError(400, error.message));
//     }
// }

// exports.getProfilePicture = async (req, res, next) => {
//     try {
//         const profilePicture = await ProfilePicture.findOne({ userId: req.params.userId });
//         if (!profilePicture) {
//             return next(createError(404, 'Profile picture not found'));
//         }
//         res.status(200).json({
//             success: true,
//             data: profilePicture
//         });
//     } catch (error) {
//         next(createError(400, error.message));
//     }
// }

exports.updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new createError('Please upload a file', 400));
        }

        imagekit.upload({
            file: req.file.buffer.toString('base64'),
            fileName: req.file.originalname,
            folder: '/profilePictures'
        }, async (err, result) => {
            if (err) {
                return res.status(400).json({
                    status: "fail",
                    message: "An error occurred during file upload. Please try again."
                });
            }

            const userId = req.params.userId;
            const user = await ProfilePicture.findOne({ user: userId });

            if (!user) {
                const profilePicture = new ProfilePicture({
                    user: userId,
                    profilePicture: result.url,
                    imagekitId: result.fileId
                });
                await profilePicture.save();
            } else {
                await imagekit.deleteFile(user.imagekitId).catch(err => {
                    console.error('Error deleting file:', err);
                });
                user.profilePicture = result.url;
                user.imagekitId = result.fileId;
                await user.save();
            }

            res.status(200).json({
                status: 'success',
                message: 'Profile picture updated successfully',
                data: {
                    user: userId,
                    profilePicture: result.url,
                    imagekitId: result.fileId
                }
            });
        });

    } catch (error) {
        return res.status(400).json({
            status: "fail",
            message: error.message
        });
    }
}

exports.getProfilePicture = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const profilePicture = await ProfilePicture.findOne({ user: userId });

        if (!profilePicture) {
            return next( new createError('Profile picture not found'), 404);
        }

        res.status(200).json({
            success: true,
            data: profilePicture
        });
    } catch (error) {
        next(new createError(error.message, 400));
    }
}

exports.deleteProfilePicture = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await ProfilePicture.findOne({ user: userId });

        if (!user) {
            return next(new createError('Profile picture not found'), 404);
        }
        else {
            await imagekit.deleteFile(user.imagekitId).then(async () => {
                // Delete the user's data from the database
                await ProfilePicture.findByIdAndDelete(user._id);

                res.status(200).json({
                    status: 'success',
                    message: 'Profile picture deleted successfully'
                });

            }
            ).catch(err => {
                return res.status(400).json({
                    status: "fail",
                    message: err.message
                });
            });
        }
    }
    catch (error) {
        next(new createError(error.message), 400);
    }
}