const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Get a reference to Firestore
const firestore = admin.firestore();
router.get("/users/:id/serviceProviders", async (req, res) => {
  const userId = req.params.id;

  try {
    console.log("Fetching user document from Firestore...");
    const usersRef = firestore.collection("users");
    const userDoc = await usersRef.doc(userId).get();

    if (!userDoc.exists) {
      console.log("User not found in Firestore.");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User document found in Firestore.");

    const userData = userDoc.data();
    const serviceProviders = userData.employees;

    console.log(userData);

    if (!serviceProviders || serviceProviders.length === 0) {
      console.log("No service providers found for the user.");
      return res.status(404).json({ error: "Service providers not found" });
    }

    console.log("Service providers found for the user.");

    // Create an array to store information for each service provider
    const serviceProviderInfo = serviceProviders.map((provider) => ({
      name: provider.name,
      phone: provider.phone,
      imageUrl: provider.imageUrl,
      workingHours: provider.workingHours,
      serviceProviderId: provider.serviceProviderId,
      workingHoursStatus: provider.workingHoursStatus,
      serviceProviderImageStatus: provider.serviceProviderImageStatus,
    }));

    console.log("Sending service provider information.");
    res.json(serviceProviderInfo);
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
