const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get a reference to Firestore
const firestore = admin.firestore();

// Define a route to fetch data from Firestore
router.get("/fetchData", async (req, res) => {
  try {
    // Reference to the "categories" collection in Firestore
    const categoriesRef = firestore.collection("categories");

    // Get the "categoryData" document
    const categoryDataDoc = await categoriesRef.doc("businessCategories").get();

    if (!categoryDataDoc.exists) {
      return res.status(404).json({ error: "Category data not found" });
    }

    // Extract the "data" field from the document
    const categoryData = categoryDataDoc.data().data;

    res.status(200).json(categoryData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
