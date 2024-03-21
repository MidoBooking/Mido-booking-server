const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Assuming you have initialized Firestore
const firestore = admin.firestore();
const businessesRef = firestore.collection("users");
router.delete(
  "/deleteProvider/:userId/:serviceProviderId",
  async (req, res) => {
    const userId = req.params.userId;
    const serviceProviderId = req.params.serviceProviderId;
    console.log(
      "Deleting service provider. User ID:",
      userId,
      "Service Provider ID:",
      serviceProviderId
    );
    try {
      console.log(
        "Deleting service provider. User ID:",
        userId,
        "Service Provider ID:",
        serviceProviderId
      );

      // Get the user document from Firestore
      const userDoc = await businessesRef.doc(userId).get();

      if (!userDoc.exists) {
        console.log("User not found. UserID:", userId);
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      console.log("User data:", userData);

      // Find the index of the service provider in the "employees" array
      const serviceProviderIndex = userData.employees.findIndex(
        (provider) => provider.serviceProviderId === serviceProviderId
      );

      if (serviceProviderIndex === -1) {
        console.log(
          "Service provider not found. ServiceProviderID:",
          serviceProviderId
        );
        return res.status(404).json({ error: "Service provider not found" });
      }

      // Remove the service provider from the "employees" array
      userData.employees.splice(serviceProviderIndex, 1);

      // Update the user document in Firestore
      await businessesRef.doc(userId).update(userData);

      // Remove the service provider from the employeeList collection
      await firestore
        .collection("employeeList")
        .doc(serviceProviderId)
        .delete();

      console.log("Service provider deleted successfully.");
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service provider:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
