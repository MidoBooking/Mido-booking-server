const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin SDK as you've already done in your main app file

// Create a route for deleting a specific booking
router.delete("/deleteBooking/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;

    // Firestore database reference
    const db = admin.firestore();

    // Create a reference to the "bookings" collection
    const bookingRef = db.collection("bookings").doc(docId);

    // Check if the booking exists
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Delete the booking
    await bookingRef.delete();

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ error: "Could not delete booking" });
  }
});

module.exports = router;
