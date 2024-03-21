const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
// Add a new route to fetch bookings by userId
router.get("/bookingsByUserId", async (req, res) => {
  try {
    // Extract the userId from the query parameters
    const userId = req.query.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Missing userId in the query parameters" });
    }

    // Firestore database reference
    const db = admin.firestore();

    // Query Firestore to get bookings for the specified userId
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("userId", "==", userId)
      .get();

    if (bookingsSnapshot.empty) {
      return res
        .status(404)
        .json({ error: "No bookings found for the specified userId" });
    }

    const bookings = [];
    bookingsSnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings by userId:", error);
    return res.status(500).json({ error: "Could not fetch bookings" });
  }
});
module.exports = router;
