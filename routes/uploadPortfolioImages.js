const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const upload = multer({ dest: "MyUploads/" });
const router = express.Router();

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

// Define a route to upload multiple images and save their URLs in the user's document
router.post(
  "/uploadPortfolioImages",
  upload.array("images", 5), // Set the field name to "images" and limit to 5 files
  async (req, res) => {
    const userId = req.body.userId;

    // Check if userId is valid
    if (!userId) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    try {
      const images = req.files;

      // Check if at least one image file was uploaded
      if (!images || images.length === 0) {
        return res.status(400).json({ error: "No image files uploaded" });
      }

      // Upload each image to Firebase Storage and set them to public
      const imageUrls = await Promise.all(
        images.map(async (imageFile) => {
          const imageUploadResponse = await bucket.upload(imageFile.path, {
            destination: `portfolioImages/${userId}-${Date.now()}-image.jpg`,
            public: true, // Set the object's ACL to public
          });

          return imageUploadResponse[0].publicUrl();
        })
      );

      // Get a reference to the Firestore document for the user
      const userDocRef = admin.firestore().collection("users").doc(userId);

      // Check if the user exists in Firestore
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

   await userDocRef.update({
  portfolioImages: admin.firestore.FieldValue.arrayUnion(...imageUrls),
});


      return res.status(200).json({
        message: "Images uploaded and URLs saved successfully",
        imageUrls,
      });
    } catch (error) {
      console.error("Error uploading images and saving URLs:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload images and save URLs" });
    }
  }
);
router.get("/fetchPortfolioImages/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Get the Firestore document for the user
    const userDocRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    // Check if the user exists in Firestore
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the list of portfolio image URLs from the user document
    const userData = userDoc.data();
    const imageUrls = userData.portfolioImages || [];

    // Return the list of image URLs to the client
    return res.status(200).json({ imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Failed to fetch images" });
  }
});
router.delete("/deletePortfolioImage/:userId/:imageId", async (req, res) => {
  const userId = req.params.userId;
  const imageId = req.params.imageId;

  try {
    // Get the Firestore document for the user
    const userDocRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    // Check if the user exists in Firestore
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the list of portfolio image URLs from the user document
    const userData = userDoc.data();
    let imageUrls = userData.portfolioImages || [];

    // Remove the image URL corresponding to the provided imageId
    imageUrls = imageUrls.filter((url) => url !== imageId);

    // Update the user document with the updated image URLs
    await userDocRef.update({ portfolioImages: imageUrls });

    // Return success message
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "Failed to delete image" });
  }
});

module.exports = router;
