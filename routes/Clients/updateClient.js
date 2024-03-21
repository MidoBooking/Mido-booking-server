const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Define the user registration route
router.post("/updateClient/:userId", (req, res) => {
  const userId = req.params.userId;
  const { name, gender, dateOfBirth, location, aboutYouSet } = req.body;

  console.log("Received request for userId:", userId);
  console.log("Received data:", name, gender, dateOfBirth, location);

  // Ensure that location contains 'latitude' and 'longitude'
  if (location && (!location.latitude || !location.longitude)) {
    console.log("Invalid location data:", location);
    return res
      .status(400)
      .json({ error: "Location must include latitude and longitude" });
  }

  const db = admin.firestore();

  const userRef = db.collection("Clients").doc(userId);

  // Check if the user exists
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("User with ID", userId, "exists.");

        // Construct the data to update
        const newData = {};
        if (name) newData.name = name;
        if (gender) newData.gender = gender;
        if (dateOfBirth) newData.dateOfBirth = dateOfBirth;
        if (location) {
          newData.location = new admin.firestore.GeoPoint(
            location.latitude,
            location.longitude
          );
        }
        if (aboutYouSet !== undefined) newData.aboutYouSet = aboutYouSet;

        // Use the `set` method with `{ merge: true }` to update only the specified fields
        userRef
          .set(newData, { merge: true })
          .then(() => {
            console.log("User information updated successfully.");
            res
              .status(200)
              .json({ message: "User information updated successfully" });
          })
          .catch((error) => {
            console.error("Error updating user information:", error);
            res
              .status(500)
              .json({ error: "Failed to update user information" });
          });
      } else {
        console.log("User with ID", userId, "not found.");
        res.status(404).json({ error: "User not found" });
      }
    })
    .catch((error) => {
      console.error("Error checking for user:", error);
      res.status(500).json({ error: "Error checking for user" });
    });
});

module.exports = router;
