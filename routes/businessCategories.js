const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get a reference to Firestore
const db = admin.firestore();

const categories = [
  "Barbershop",
  "Spa",
  "Eyebrows & Lashes",
  "Hair Removal",
  "Hair Salon",
  "Health and Wellness",
  "Makeup Artist",
  "Massage",
  "Nail Salon",
  "Personal Trainer",
  "Skin Care",
  "Tattoo Shops",
  "Bridal Service",
  "Hand and foot treatments",
];

// Endpoint to fetch categories
router.get("/categories", (req, res) => {
  res.json({ categories });
});

// Endpoint to save options
router.post("/setBusinessCategories/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { businesscategories } = req.body;

    if (!userId || !businesscategories) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    const userRef = db.collection("users").doc(userId);

    // Update Firestore document with businesscategories
    await userRef.set(
      { businesscategories, businessCategoryStatus: true },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error setting business categories:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
