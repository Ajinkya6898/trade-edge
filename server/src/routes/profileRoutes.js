import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../controllers/profileController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router
  .route("/")
  .get(authMiddleware, getProfile)
  .put(authMiddleware, updateProfile);
router.post(
  "/photo",
  authMiddleware,
  upload.single("photo"),
  uploadProfilePhoto
);

export default router;
