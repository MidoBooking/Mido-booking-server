const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

// Define a route to upload an image and save its URL in the employees array
router.post("/uploadImage", upload.single("image"), async (req, res) => {
  const userId = req.body.userId;
  const serviceProviderId = req.body.serviceProviderId;

  // Check if userId and serviceProviderId are valid
  if (!userId || !serviceProviderId) {
    return res
      .status(400)
      .json({ error: "Invalid userId or serviceProviderId" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const imageFile = req.file;

    // Upload the image to Firebase Storage and set it to public
    const imageUploadResponse = await bucket.upload(imageFile.path, {
      destination: `serviceProviderImage/${userId}-${serviceProviderId}-${Date.now()}-image.jpg`,
      public: true, // Set the object's ACL to public
    });

    const imageUrl = imageUploadResponse[0].publicUrl();

    // Get a reference to the Firestore document for the user
    const userDocRef = admin.firestore().collection("users").doc(userId);

    // Check if the user exists in Firestore
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the existing employees array or initialize it if it doesn't exist
    const employees = userDoc.data().employees || [];

    // Find the employee (service provider) within the employees array by serviceProviderId
    const employeeIndex = employees.findIndex(
      (employee) => employee.serviceProviderId === serviceProviderId
    );

    if (employeeIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Add the image URL to the employee's data
    employees[employeeIndex].imageUrl = imageUrl;
// Set serviceProviderImageStatus to true
    employees[employeeIndex].serviceProviderImageStatus = true;
    // Update the user document with the updated employees array
    await userDocRef.update({ employees });

    return res.status(200).json({
      message: "Image uploaded and URL saved successfully",
      employees,
    });
  } catch (error) {
    console.error("Error uploading image and saving URL:", error);
    return res
      .status(500)
      .json({ error: "Failed to upload image and save URL" });
  }
});

module.exports = router;
