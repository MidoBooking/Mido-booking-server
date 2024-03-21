const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const firestore = admin.firestore();

// Get paginated users
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Convert page to an integer
    const pageSize = 10;

    const usersRef = firestore.collection("users");
    const snapshot = await usersRef
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .get();

    const users = snapshot.docs.map((doc) => {
      const userData = doc.data();
      return {
        id: doc.id,
        businessName: userData.businessName,
        email: userData.email,
        location: userData.location,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        recommended: userData.recommended,
        featured: userData.featured,
        businessPicture: userData.businessPicture,
        businesscategories: userData.businesscategories,
        services: userData.services,
        serviceProviders: userData.employees,
        portfolioImages: userData.portfolioImages,
      };
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userData = userDoc.data();
    const user = {
      id: userDoc.id,
      businessName: userData.businessName,
      email: userData.email,
      location: userData.location,
      name: userData.name,
      phone: userData.phone,
      recommended: userData.recommended,
      featured: userData.featured,
      businessPicture: userData.businessPicture,
      businesscategories: userData.businesscategories,
      services: userData.services,
      serviceProviders: userData.employees,
      portfolioImages: userData.portfolioImages,
    };

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
