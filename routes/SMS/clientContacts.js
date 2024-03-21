const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

router.post("/saveContacts/:id", async (req, res) => {
  try {
    // Extract the user id from the request parameters
    const businessOwnerId = req.params.id;

    // Extract the imported contacts from the request body
    const { contacts } = req.body;

    // Get the current date in the format dd/mm/yyyy
    const currentDate = new Date().toLocaleDateString("en-GB");

    // Add the current date to each contact entry
    const contactsWithDate = contacts.map((contact) => ({
      ...contact,
      date: currentDate,
    }));

    // Get a reference to the Firebase database
    const db = admin.firestore();

    // Check if the document already exists
    const docRef = db.collection("contacts").doc(businessOwnerId);
    const doc = await docRef.get();

    if (doc.exists) {
      // If the document exists, update the contacts array
      await docRef.update({
        contacts: admin.firestore.FieldValue.arrayUnion(...contactsWithDate),
      });
    } else {
      // If the document doesn't exist, create a new document
      await docRef.set({
        contacts: contactsWithDate,
      });
    }

    // Send a success response
    res.status(200).json({ message: "Contacts saved successfully" });
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error saving contacts:", error);
    res.status(500).json({ error: "Failed to save contacts" });
  }
});

router.get("/getContacts/:id", async (req, res) => {
  try {
    // Extract the user id from the request parameters
    const businessOwnerId = req.params.id;

    // Get a reference to the Firebase database
    const db = admin.firestore();

    // Retrieve the contacts document from Firestore
    const docRef = db.collection("contacts").doc(businessOwnerId);
    const doc = await docRef.get();

    if (doc.exists) {
      // If the document exists, send the contacts array as a response
      const contacts = doc.data().contacts;
      res.status(200).json({ contacts });
    } else {
      // If the document doesn't exist, send a 404 response
      res.status(404).json({ error: "Contacts not found" });
    }
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});
router.get("/getRecentContacts/:id", async (req, res) => {
  try {
    // Extract the user id from the request parameters
    const businessOwnerId = req.params.id;

    // Get a reference to the Firebase database
    const db = admin.firestore();

    // Retrieve the contacts document from Firestore
    const docRef = db.collection("contacts").doc(businessOwnerId);
    const doc = await docRef.get();

    if (doc.exists) {
      // If the document exists, filter recent contacts (saved in the past 30 days)
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(
        currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      const contacts = doc.data().contacts;
      const recentContacts = contacts.filter((contact) => {
        // Parse the date string from Firestore into a Date object
        const [day, month, year] = contact.date.split("/");
        const contactDate = new Date(`${month}/${day}/${year}`);
        return contactDate > thirtyDaysAgo && contactDate <= currentDate;
      });

      // Send the filtered recent contacts as a response
      res.status(200).json({ contacts: recentContacts });
    } else {
      // If the document doesn't exist, send a 404 response
      res.status(404).json({ error: "Contacts not found" });
    }
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching recent contacts:", error);
    res.status(500).json({ error: "Failed to fetch recent contacts" });
  }
});

module.exports = router;
