const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Assuming admin.initializeApp() is done elsewhere in your code

const db = admin.firestore();

// Middleware to parse JSON bodies
router.use(express.json());

router.post("/paymentAnalytics", async (req, res) => {
  try {
    const { businessOwnerId, selectedCalendar } = req.body;

    console.log("businessOwnerId:", businessOwnerId);
    console.log("selectedCalendar:", selectedCalendar);

    // Query bookings collection
    const snapshot = await db
      .collection("bookings")
      .where("businessOwnerId", "==", businessOwnerId)
      .where("payment", "==", true)
      .get();

    const bookingsData = [];

    snapshot.forEach((doc) => {
      const booking = doc.data();
      // Check if selectedCalendar matches
      if (booking.selectedCalendar === selectedCalendar) {
        // Extract required fields
        const { selectedServiceProviderName, services, totalPrice } = booking;
        bookingsData.push({
          selectedServiceProviderName,
          services,
          totalPrice,
        });
      }
    });

    res.json({ bookings: bookingsData });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

module.exports = router;
