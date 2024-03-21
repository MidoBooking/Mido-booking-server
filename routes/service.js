const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get a reference to Firestore
const firestore = admin.firestore();

// Define a route to upload multiple services to a user's document in Firestore
router.post("/addServices", async (req, res) => {
  try {
    const { userId, services } = req.body;
    console.log("Received request with body:", req.body);

    if (!Array.isArray(services)) {
      res.status(400).json({ error: "Services must be provided as an array" });
      return;
    }

    // Create a reference to the user's document in the "users" collection
    const userDocRef = firestore.collection("users").doc(userId);

    // Update the user's document with the array of services
   await userDocRef.update({
      services: admin.firestore.FieldValue.arrayUnion(...services),
      serviceFormStatus: true,
    });

    res.status(201).json({ message: "Services uploaded successfully" });
  } catch (error) {
    console.error("Error uploading services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
