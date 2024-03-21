const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios");

const router = express.Router();

// Get a reference to Firestore
const firestore = admin.firestore();

// Function to generate a random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
}

router.post("/employeeRegisterOTP", async (req, res) => {
  try {
    let phoneNumber = req.body.phoneNumber;
    let otp = generateOTP(); // Generate OTP

    const message = `Your OTP is ${otp}`; // Include OTP in the message

    const payload = {
      from: "e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
      sender: "Mido",
      to: phoneNumber,
      message: message,
    };

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
        // Store OTP in Firestore for verification later
        await firestore.collection("OTP").doc(phoneNumber).set({
          otp: otp,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).send("OTP sent successfully");
      } else {
        res.status(500).send("Failed to send OTP");
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

router.post("/employeeProviderRegisterVerify", async (req, res) => {
  try {
    const { phoneNumber, otp, adminId, employeeName } = req.body;

    // Query Firestore to get the stored OTP for the provided phoneNumber
    const otpDoc = await firestore.collection("OTP").doc(phoneNumber).get();

    if (!otpDoc.exists) {
      // If no OTP exists for the provided phoneNumber
      return res
        .status(404)
        .json({ error: "OTP not found for the provided phone number" });
    }

    // Extract the stored OTP
    const storedOTP = otpDoc.data().otp;

    // Verify if the provided OTP matches the stored OTP
    if (otp == storedOTP) {
      // OTP is valid

      // Check if the admin user exists
      const adminUserRef = firestore.collection("users").doc(adminId);
      const adminUserDoc = await adminUserRef.get();

      if (!adminUserDoc.exists) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      // Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({ phoneNumber });
      console.log("User created with UID:", userRecord.uid);

      // Save employee details under the admin user
      const adminUserData = adminUserDoc.data();
      const existingEmployees = adminUserData.employees || [];

      // Create a new employee object with the userRecord.uid as the unique ID
      const newEmployee = {
        adminId: adminId,
        serviceProviderId: userRecord.uid,
        phone: phoneNumber,
        name: employeeName,
      };

      // Merge the new employee data with the existing employees array
      const updatedEmployees = [...existingEmployees, newEmployee];

      // Update the Firestore document with the updated employees array
      await adminUserRef.update({
        employees: updatedEmployees,
      });

      console.log("Employee data saved under admin user in Firestore");

      // Save a copy of the employee data in the "employeeList" collection using userRecord.uid as the document ID
      const employeeListRef = firestore
        .collection("employeeList")
        .doc(userRecord.uid);
      await employeeListRef.set(newEmployee);

      console.log("Employee data saved in employeeList collection");

      // Delete the OTP entry from Firestore
      await firestore.collection("OTP").doc(phoneNumber).delete();

      // Send the user ID in the response upon successful verification
      res.status(200).json({ userId: userRecord.uid }); // Include userId in the response
    } else {
      // Provided OTP doesn't match the stored OTP
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "An error occurred while verifying OTP" });
  }
});

router.post("/employeeProviderRegisterCheck", async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Query Firestore to check if the phone number exists in the 'users' collection
    const querySnapshot = await firestore
      .collection("employeeList")
      .where("phone", "==", phoneNumber)
      .get();

    if (!querySnapshot.empty) {
      // Phone number exists
      // Extracting user ID from the first document in the snapshot
      const userId = querySnapshot.docs[0].id;
      res.status(200).json({ exists: true, userId: userId });
    } else {
      // Phone number doesn't exist
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking phone number:", error);
    res
      .status(500)
      .json({ error: "An error occurred while checking phone number" });
  }
});

module.exports = router;
