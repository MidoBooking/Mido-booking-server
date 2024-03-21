const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/bulkSMS", async (req, res) => {
  try {
    // Parse the incoming request body to extract selectedClientsPhones array
    const { selectedClientsPhones, message } = req.body;

    // Message to be sent

    // Payload for the bulk SMS
    const payload = {
      to: selectedClientsPhones,
      message: message,
      from: "e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
      sender: "Mido",
      campaign: "Service Provider Campagin",
      createCallback: "YOUR_CREATE_CALLBACK",
      statusCallback: "YOUR_STATUS_CALLBACK",
    };

    console.log("Payload:", payload);

    // Send the bulk SMS using axios
    const response = await axios.post(
      "https://api.afromessage.com/api/bulk_send",
      payload,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoidWs1eUlpaGt3NGk2bXlFV0lzSVF6dTVKSTdsRmxlcmciLCJleHAiOjE4NjYyOTMwMDMsImlhdCI6MTcwODQ0MDIwMywianRpIjoiMDM1ZjYwZTAtY2E2OC00YzliLWExMjMtZGYyYTRhOTRhMTQ0In0.a8UL9KKTw2JIfI1kV8b6G59tMLzHPzV__NklG7gr6QA",
        },
      }
    );

    console.log("Response:", response.data);

    // Handle response
    if (response.status === 200) {
      // Response object ... inspect the `acknowledge` node and act accordingly
      if (response.data.acknowledge === "success") {
        res.status(200).send("Bulk SMS sent successfully");
      } else {
        res.status(500).send("Failed to send bulk SMS");
      }
    } else {
      // Most probably authorization error ... inspect response
      console.error("Other HTTP Code:", response.status);
      res.status(500).send("Other HTTP Code: " + response.status);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error: " + error.message);
  }
});

module.exports = router;
