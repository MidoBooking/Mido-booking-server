// setBooking.js

const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin SDK as you've already done in your main app file

// Create a route for setting a booking
router.post("/setBooking", async (req, res) => {
  try {
    const {
      businessOwnerId,
      businessName,
      serviceProviderId,
      selectedDate,
      services,
      selectedCalendar,
      selectedTimeSlot,
      selectedEndTime,
      userId,
      serviceDuration,
      userLocation,
      imageUrl,
      approved = false,
      payment = false,
      totalPrice,
      selectedServiceProviderName,
      expoPushToken,
    } = req.body;

    // Firestore database reference
    const db = admin.firestore();

    // Create a new booking document
    const bookingRef = db.collection("bookings").doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    // Data to be stored in Firestore
    const bookingData = {
      businessOwnerId,
      businessName,
      serviceProviderId,
      selectedDate,
      services,
      selectedCalendar,
      selectedTimeSlot,
      selectedEndTime,
      userId,
      serviceDuration,
      imageUrl,
      userLocation: new admin.firestore.GeoPoint(
        userLocation.latitude,
        userLocation.longitude
      ),
      approved,
      payment,
      createdAt: timestamp,
      totalPrice,
      selectedServiceProviderName,
      expoPushToken,
    };

    // Set the booking data in Firestore
    await bookingRef.set(bookingData);

    return res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Could not create booking" });
  }
});

module.exports = router;
