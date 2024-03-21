const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Define the user registration route
router.post("/register/:userId", (req, res) => {
  const userId = req.params.userId;
  const { name, businessName, location } = req.body;

  // Ensure that location contains 'latitude' and 'longitude'
  if (!location || !location.latitude || !location.longitude) {
    return res
      .status(400)
      .json({ error: "Location must include latitude and longitude" });
  }

  const db = admin.firestore();

  const userRef = db.collection("users").doc(userId);

  // Create a new user if not exists, or update if exists
  const newData = {
    name,
    businessName,
    location: new admin.firestore.GeoPoint(
      location.latitude,
      location.longitude
    ),
    aboutYouSet: true,
  };

  userRef
    .set(newData, { merge: true })
    .then(() => {
      res
        .status(200)
        .json({ message: "User information updated successfully" });
    })
    .catch((error) => {
      console.error("Error updating user information:", error);
      res.status(500).json({ error: "Failed to update user information" });
    });
});

module.exports = router;
