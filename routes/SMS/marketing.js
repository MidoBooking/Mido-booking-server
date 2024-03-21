const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();
const axios = require("axios");

router.post("/marketing", async (req, res) => {
  let name = req.body.name;
  let phoneNumber = req.body.phoneNumber;
  let businessName = req.body.businessName;
  let selectedServiceProviderName = req.body.selectedServiceProviderName;
  let selectedServiceProviderPhone = req.body.selectedServiceProviderPhone;
  let selectedtimeslot = req.body.selectedtimeslot;
  let selectedCalendar = req.body.selectedCalendar;
  let businessOwnerId = req.body.businessOwnerId;
  let serviceProviderId = req.body.serviceProviderId;
  console.log(selectedCalendar, businessOwnerId, serviceProviderId);

  const message = `New appointment request `;
  const payload = {
    from: "e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
    sender: "Mido",
    to: selectedServiceProviderPhone,
    message: message,
  };

  try {
    const response = await axios.post(
      "https://api.afromessage.com/api/send",
      payload,
      {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoidWs1eUlpaGt3NGk2bXlFV0lzSVF6dTVKSTdsRmxlcmciLCJleHAiOjE4NjYyOTMwMDMsImlhdCI6MTcwODQ0MDIwMywianRpIjoiMDM1ZjYwZTAtY2E2OC00YzliLWExMjMtZGYyYTRhOTRhMTQ0In0.a8UL9KKTw2JIfI1kV8b6G59tMLzHPzV__NklG7gr6QA", 
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
