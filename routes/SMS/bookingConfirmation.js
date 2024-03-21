const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const axios = require("axios");

router.post("/bookingConfirmation", async (req, res) => {
 let name = req.body.name;
  let phoneNumber = req.body.phoneNumber;

  const message = `Dear ${name}, your reservation has been verified. Kindly make half payment using the Mido Appointments page.`;
  const payload = {
    from: "e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
    sender: "Mido",
    to: phoneNumber,
    message: message,
  };

  try {
    const response = await axios.post(
      "https://api.afromessage.com/api/send",
      payload,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoidWs1eUlpaGt3NGk2bXlFV0lzSVF6dTVKSTdsRmxlcmciLCJleHAiOjE4NjYyOTMwMDMsImlhdCI6MTcwODQ0MDIwMywianRpIjoiMDM1ZjYwZTAtY2E2OC00YzliLWExMjMtZGYyYTRhOTRhMTQ0In0.a8UL9KKTw2JIfI1kV8b6G59tMLzHPzV__NklG7gr6QA"
        },
      }
    );

    // Handle response
    if (response.status === 200) {
      // Response object ... inspect the `acknowledge` node and act accordingly
      if (response.data.acknowledge === "success") {
        res.status(200).send("Api success");
      } else {
        res.status(500).send("Api failure");
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

