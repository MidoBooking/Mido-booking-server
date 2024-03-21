const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const profileImageUpload = multer({ dest: "ProfileImages/" });
const router = express.Router();

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

// Define a route to upload an image and save its URL in the user's document
router.post(
  "/clientProfileImage",
  profileImageUpload.single("image"),
  async (req, res) => {
    const userId = req.body.userId;

    // Check if userId is valid
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imageFile = req.file;

      // Upload the image to Firebase Storage and set it to public
      const imageUploadResponse = await bucket.upload(imageFile.path, {
        destination: `clientImages/${userId}-${Date.now()}-image.jpg`,
        public: true, // Set the object's ACL to public
      });

      const imageUrl = imageUploadResponse[0].publicUrl();

      // Get a reference to the Firestore document for the user
      const userDocRef = admin.firestore().collection("Clients").doc(userId);

      // Check if the user exists in Firestore
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update the user document with the image URL
      await userDocRef.update({ profilePicture: imageUrl });

      return res.status(200).json({
        message: "Image uploaded and URL saved successfully",
        imageUrl,
      });
    } catch (error) {
      console.error("Error uploading image and saving URL:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload image and save URL" });
    }
  }
);

module.exports = router;
