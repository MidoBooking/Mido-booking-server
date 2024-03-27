const express = require("express");
const admin = require("firebase-admin");
const moment = require("moment-timezone");
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
    console.log("expo push token is", expoPushToken);
    // Firestore database reference
    const db = admin.firestore();

    // Convert selectedDateTime to UTC+3
    // Combine selected date and time
    const [day, month, year] = selectedCalendar.split("/");
    const [hour, minute] = selectedTimeSlot.split(":");
    const selectedDateTime = new Date(
      Date.UTC(year, month - 1, day, hour, minute)
    );

    // Adjust the selectedDateTime to UTC+3 timezone
    selectedDateTime.setUTCHours(selectedDateTime.getUTCHours() + 3);

    // Convert the JavaScript Date object to a Firestore timestamp
    const selectedTimestamp =
      admin.firestore.Timestamp.fromDate(selectedDateTime);

    // Create a new booking document
    const bookingRef = db.collection("bookings").doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    // Data to be stored in Firestore
    console.log(
      "selected calendar is",
      selectedCalendar,
      "selected hour is",
      selectedTimeSlot
    );
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
      notificationAt: timestamp,
      selectedDateTime, // Adding selectedDateTime to the booking data
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
