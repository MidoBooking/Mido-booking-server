const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin SDK as you've already done in your main app file

// Create a route for updating a specific booking
router.put("/finishBooking/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;
    const { finished } = req.body;

    // Validate that 'approved' is a boolean
    if (typeof finished !== "boolean") {
      return res.status(400).json({ error: "'approved' must be a boolean" });
    }

    // Firestore database reference
    const db = admin.firestore();

    // Create a reference to the "bookings" collection
    const bookingRef = db.collection("bookings").doc(docId);

    // Check if the booking exists
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update the 'approved' field
    await bookingRef.update({ finished });

    return res.status(200).json({ message: "Booking finished successfully" });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ error: "Could not update booking" });
  }
});

module.exports = router;
