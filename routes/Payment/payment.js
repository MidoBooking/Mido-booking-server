const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const firestore = admin.firestore();
const axios = require("axios");
const Telebirr = require("./telebirr");

let bookingId = null;
// Initialize Telebirr with your Telebirr credentials
const telebirr = new Telebirr({
  appId: "70f0e6a45e114349bf70cdc608b6ba0b",
  appKey: "004f05e8263247bda3cca8e5f07cac8c",
  shortCode: "513253",
  publicKey: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh/wedfRslhp89S9LSNZAmhmlwfVb0ML3O9CQItlMLTU5nMDESEFGkMwEaEyrNvLy48fCEqvWml8gt7N/H2dL77e6a2kmawfozQMUjLJPlntZ6nt3pjWxJrBfx5V0o/dZjPOk+eNk+65lvqoBqF5Lcf3Zath9JNfH/9/1J7J1lFFN86hLNmzhLQIODmr7TMVNS1HmWFwVWBuYB8E55x/at4VvXcNkuoHLCdWkkN3lVwpK+owQYYwvDCw/W25l+OF2ATqBmhVc3Y2UFqNUxzuH7sGLsD/PwKsOlnXFErdB4DbjJRgoBIizah+Httr0+P5bOnFtO+SbjPAW9no2O8McyQIDAQAB`,
});
// Telebirr payment route
// /make-payment Route
router.post("/make-payment", async (req, res) => {
  try {
    console.log("Payment info:", req.body);
    const paymentInfo = req.body;
    

    const paymentResult = await telebirr.makePayment(paymentInfo);
    res.json(paymentResult);

    // No need to store bookingId globally, it's passed with paymentInfo
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /notifyUrl Route
// /notifyUrl Route
router.post("/notifyUrl/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId; // Extract bookingId from URL params

    console.log("Received notification for bookingId:", bookingId);

    // Update Firestore document with approved = true for the specific bookingId
    const bookingRef = firestore.collection("bookings").doc(bookingId);
    await bookingRef.update({ payment: true });

    console.log("Firestore document updated successfully.");

    res.status(200).send("Notification received and processed successfully.");
  } catch (error) {
    console.error("Error updating Firestore:", error);
    res.status(500).json({ error: "Error updating Firestore" });
  }
});



// Payment status route by booking ID
router.get("/payment-status/:bookingId", (req, res) => {
  if (bookingId !== undefined) {
    res.json({
      bookingId: bookingId,
    });
  } else {
    res
      .status(404)
      .json({ error: "Payment status not found for the given booking ID." });
  }
});

module.exports = router;
