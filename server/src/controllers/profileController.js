import Profile from "../models/Profile.js";
import asyncHandler from "express-async-handler";

/**
 * @desc Get user profile
 * @route GET /api/profile
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  let profile = await Profile.findOne({ user: userId });

  // auto-create profile if not found
  if (!profile) {
    profile = await Profile.create({
      user: userId,
      email: req.user.email, // optional default
      name: req.user.name || "",
    });
  }

  res.json(profile);
});

/**
 * @desc Update user profile
 * @route PUT /api/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const updateData = req.body;

  const updatedProfile = await Profile.findOneAndUpdate(
    { user: userId },
    updateData,
    { new: true, upsert: true }
  );

  res.json({
    message: "Profile updated successfully",
    profile: updatedProfile,
  });
});

/**
 * @desc Upload profile photo
 * @route POST /api/profile/photo
 * @access Private
 */
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const photoPath = `/uploads/profilePhotos/${req.file.filename}`;

  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    { profilePhoto: photoPath },
    { new: true, upsert: true }
  );

  res.json({
    message: "Profile photo uploaded successfully",
    profilePhoto: photoPath,
    profile,
  });
});
