const express = require("express");
const admin = require("firebase-admin");
const moment = require("moment");
const router = express.Router();
const db = admin.firestore();

router.put("/editBooking/:bookingId", async (req, res) => {
  try {
    const {
      selectedServiceProviderId,
      selectedDate,
      selectedCalendar,
      selectedBookingId,
    } = req.body;

    // Assuming you receive selectedTimeSlot and serviceDuration from the user
    const { selectedTimeSlot, serviceDuration } = req.body;

    // Function to calculate end time based on start time and service duration
    const startTime = moment(selectedTimeSlot, "hh:mm A");
    const endTime = startTime.clone().add(serviceDuration, "minutes");

    // Function to format end time
    const formattedEndTime = endTime.format("hh:mm A");

    // Update booking data in Firestore
    const bookingRef = db.collection("bookings").doc(selectedBookingId);
    await bookingRef.update({
      serviceProviderId: selectedServiceProviderId,
      selectedDate,
      selectedCalendar,
      selectedTimeSlot,
      selectedEndTime: formattedEndTime,
    });

    return res.status(200).json({ message: "Booking updated successfully" });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
