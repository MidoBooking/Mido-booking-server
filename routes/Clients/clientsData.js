const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const firestore = admin.firestore();

// Get all Clients
router.get("/clientList", async (req, res) => {
  try {
    const ClientsRef = firestore.collection("Clients");
    const snapshot = await ClientsRef.get();
    const Clients = [];

    snapshot.forEach((doc) => {
      const userData = doc.data();
      Clients.push({
        id: doc.id,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        profilePicture: userData.profilePicture,
        location: userData.location,
      });
    });

    res.json(Clients);
  } catch (error) {
    console.error("Error fetching Clients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get a specific client by ID
router.get("/client/:id", async (req, res) => {
  try {
    const clientId = req.params.id;
    const clientDoc = await firestore.collection("Clients").doc(clientId).get();

    if (!clientDoc.exists) {
      return res.status(404).json({ error: "Client not found" });
    }

    const userData = clientDoc.data();
    const clientDetails = {
      id: clientDoc.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      profilePicture: userData.profilePicture,
      location: userData.location,
    };

    res.json(clientDetails);
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
