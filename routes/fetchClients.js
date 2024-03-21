const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
// Define a route to retrieve and display user data
router.get("/fetchClients/:userId", (req, res) => {
  const userId = req.params.userId;

  // Initialize a connection to Firebase Firestore
  const db = admin.firestore();

  // Reference to the user's document
  const userRef = db.collection("Clients").doc(userId);

  // Get the user's document
  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        // User document exists, retrieve and send user data
        const userData = doc.data();
        const { name, location, phoneNumber } = userData;

        // Construct a response JSON object with the user's name and location
        const responseData = {
          name,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          phoneNumber,
        };

        res.status(200).json(responseData);
      } else {
        // User document does not exist
        res.status(404).json({ error: "User not found" });
      }
    })
    .catch((error) => {
      // Error handling for Firestore query
      console.error("Error retrieving user data:", error);
      res.status(500).json({ error: "Error retrieving user data" });
    });
});

module.exports = router;
