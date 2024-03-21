const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Storage
const bucket = admin.storage().bucket();

// Define a route to fetch an uploaded image by userId and serviceProviderId
router.get("/getImage/:userId/:serviceProviderId", async (req, res) => {
  const userId = req.params.userId;
  const serviceProviderId = req.params.serviceProviderId;

  try {
    // Get a reference to the Firestore document for the user
    const userDocRef = admin.firestore().collection("users").doc(userId);

    // Check if the user exists in Firestore
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the employees array from the user document
    const employees = userDoc.data().employees || [];

    // Find the employee (service provider) within the employees array by serviceProviderId
    const employee = employees.find(
      (employee) => employee.serviceProviderId === serviceProviderId
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Get the image URL from the employee data
    const imageUrl = employee.imageUrl;

    if (!imageUrl) {
      return res
        .status(404)
        .json({ error: "Image URL not found for this employee" });
    }

    // Redirect to the image URL
    res.redirect(imageUrl);
  } catch (error) {
    console.error("Error fetching image:", error);
    return res.status(500).json({ error: "Failed to fetch image" });
  }
});

module.exports = router;
