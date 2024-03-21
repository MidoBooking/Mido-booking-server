const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const axios = require("axios");

router.post("/waitingListConfirmation", async (req, res) => {
  const apiUrl = "http://api.kmicloud.com/sms/send/v1/marketing";
  let business_name = req.body.name;
  let phoneNumber = req.body.phoneNumber;

  // Remove non-numeric characters from the phone number
  phoneNumber = phoneNumber.replace(/\D/g, "");

  // Add the country code in the required format (assuming country code is '00251')
  phoneNumber = phoneNumber.replace(/^0/, "00251");

  const message = `ውድ ${business_name} ከ Mido Booking App ቀዳሚ ጀማሪዎች መካከል ለመሆን ስለተመዘገቡ እናመሰግናለን!`;
  const payload = {
    accessKey: "984913ff61a646edb2305d433c6315a1",
    secretKey: "de6464b05f064ae4a8b5e2a25718ac0f",
    from: "mido",
    to: phoneNumber,
    message: message,
  };

  try {
    const response = await axios.post(apiUrl, payload);
    console.log("SMS sent successfully:");
    res.json({ success: true, message: "SMS sent successfully" });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ success: false, message: "Error sending SMS" });
  }
});

module.exports = router;
