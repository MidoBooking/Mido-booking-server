const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Define a route to edit working hours for a specific user and employee (service provider)
router.post("/editWorkingHours", async (req, res) => {
  try {
    const { userId, serviceProviderId, workingHours } = req.body;

    // Get a reference to the Firestore document for the user
    const userDocRef = admin.firestore().collection("users").doc(userId);

    // Check if the user exists in Firestore
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the existing employees array or initialize it if it doesn't exist
    const employees = userDoc.data().employees || [];

    // Find the employee (service provider) within the employees array by serviceProviderId
    const employeeIndex = employees.findIndex(
      (employee) => employee.serviceProviderId === serviceProviderId
    );

    if (employeeIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Merge the existing working hours with the new working hours
    const existingWorkingHours = employees[employeeIndex].workingHours || {};
    const updatedWorkingHours = { ...existingWorkingHours, ...workingHours };

    // Update the workingHours for the employee with the merged working hours
    employees[employeeIndex].workingHours = updatedWorkingHours;

    // Update the user document with the updated employees array
    await userDocRef.update({ employees });

    return res.status(200).json({
      message: "Working hours edited successfully",
      employees, // Return the updated employees array
    });
  } catch (error) {
    console.error("Error editing working hours:", error);
    return res.status(500).json({ error: "Failed to edit working hours" });
  }
});

module.exports = router;
