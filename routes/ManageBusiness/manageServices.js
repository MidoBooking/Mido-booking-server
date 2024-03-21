const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const firestore = admin.firestore();

// GET Services for a User Endpoint
router.get("/manageServices/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the user document from Firestore
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userData = userDoc.data();

    // Extract services array from user data
    const services = userData.services || [];

    res.json(services);
  } catch (error) {
    console.error("Error fetching services for user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE Service for a User Endpoint
router.delete("/deleteService/:userId/:index", async (req, res) => {
  try {
    const userId = req.params.userId;
    const index = parseInt(req.params.index);

    // Fetch the user document from Firestore
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Extract services array from user data
    let services = userDoc.data().services || [];

    // Check if the provided index is within the valid range
    if (index < 0 || index >= services.length) {
      res.status(400).json({ message: "Invalid array index" });
      return;
    }

    // Remove the service at the specified index
    const deletedService = services.splice(index, 1);

    // Update the user document in Firestore with the modified services array
    await userDoc.ref.update({ services });

    res.json({ message: "Service deleted successfully", deletedService });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.put("/editService/:userId/:index", async (req, res) => {
  try {
    const userId = req.params.userId;
    const index = parseInt(req.params.index);
    const updatedServiceData = req.body; // Assuming the updated service data is sent in the request body

    // Fetch the user document from Firestore
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Extract services array from user data
    let services = userDoc.data().services || [];

    // Check if the provided index is within the valid range
    if (index < 0 || index >= services.length) {
      res.status(400).json({ message: "Invalid array index" });
      return;
    }

    // Update the service at the specified index with the new data
    services[index] = updatedServiceData;

    // Update the user document in Firestore with the modified services array
    await userDoc.ref.update({ services });

    res.json({
      message: "Service updated successfully",
      updatedService: services[index],
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
