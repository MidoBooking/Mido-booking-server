const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const axios = require("axios");
// POST route to handle incoming notification requests
router.post("/expoPushNotification", async (req, res) => {
  try {
    const { to, title, body, data } = req.body;

    // Validate request body
    if (!to || !title || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Construct payload
    const payload = {
      to,
      title,
      body,
      data,
    };

    // Send POST request to Expo push notification endpoint
    const response = await fetch(
      "https://api.expo.dev/v2/push/send?useFcmV1=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // Check response status and send appropriate response
    if (response.ok) {
      const responseData = await response.json();
      res.status(200).json(responseData);
    } else {
      const errorData = await response.json();
      res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
