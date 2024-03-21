const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

router.get("/booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const bookingRef = db.collection("bookings").doc(bookingId);

    const doc = await bookingRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingData = doc.data();
    return res.status(200).json(bookingData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
