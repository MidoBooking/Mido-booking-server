const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get a reference to Firestore
const firestore = admin.firestore();

// Define a route to upload data to Firestore
router.post("/uploadData", async (req, res) => {
  // Log the request body for debugging purposes
  console.log("Received request with body:", req.body);

  try {
    const dataToUpload = req.body;

    if (!dataToUpload || !Array.isArray(dataToUpload)) {
      // Log the validation failure
      console.log("Validation failed - Invalid data format");
      return res.status(400).json({ error: "Invalid data format" });
    }

    // Reference to the "categories" collection in Firestore
    const categoriesRef = firestore.collection("categories");

    // Create an array to store the data
    const dataArray = [];

    // Loop through dataToUpload and add objects to dataArray
    dataToUpload.forEach((item) => {
      const { key, name, icon } = item;

      if (!key || !name || !icon) {
        // Log the validation failure
        console.log("Validation failed - Missing required fields:", item);
        return res.status(400).json({ error: "Missing required fields" });
      }

      dataArray.push({ key, name, icon });
    });

    // Add dataArray to Firestore as a single document
    await categoriesRef.doc("businessCategories").set({ data: dataArray });

    res.status(201).json({ message: "Data uploaded successfully" });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
