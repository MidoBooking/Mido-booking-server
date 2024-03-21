const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin SDK as you've already done in your main app file

// Create a route for fetching booking data
router.get("/fetchBooking", async (req, res) => {
  try {
    const businessOwnerId = req.query.businessOwnerId;
    const selectedCalendar = req.query.selectedCalendar;
    const serviceProviderId = req.query.serviceProviderId;

    // Firestore database reference
    const db = admin.firestore();

    // Create a reference to the "bookings" collection
    let query = db.collection("bookings");

    // Apply filters based on query parameters
    if (businessOwnerId) {
      query = query.where("businessOwnerId", "==", businessOwnerId);
    }

    if (selectedCalendar) {
      query = query.where("selectedCalendar", "==", selectedCalendar);
    }

    if (serviceProviderId) {
      query = query.where("serviceProviderId", "==", serviceProviderId);
    }

    // Execute the query to fetch matching booking documents
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "No matching bookings found" });
    }

    const bookings = [];

    querySnapshot.forEach((doc) => {
      const bookingData = doc.data();
      const bookingWithId = { id: doc.id, ...bookingData }; // Include 'id' property
      console.log("Booking id is ", doc.id); // Log the doc.id
      bookings.push(bookingWithId);
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ error: "Could not fetch bookings" });
  }
});

module.exports = router;
