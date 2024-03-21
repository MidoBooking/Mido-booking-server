express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

const firestore = admin.firestore();

// Function to calculate Haversine distance between two points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Get users with calculated distances and implement pagination
router.post("/makeupUsers", async (req, res) => {
  try {
    // Extract user location and page from the request body
    const { userLocation, page = 1 } = req.body;
    const { latitude: userLat, longitude: userLon } = userLocation;

    // Set the number of items per page
    const itemsPerPage = 10;

    // Get a reference to the "users" collection in Firestore
    const usersRef = firestore.collection("users");

    // Get a snapshot of all documents in the "users" collection
    const snapshot = await usersRef.get();

    // Create an array to store user data with calculated distances
    const usersWithDistance = [];

    snapshot.forEach((doc) => {
      const userData = doc.data();

      // Check if the business has the desired categories
      const hasBarbershopOrSpa =
        userData.businesscategories &&
        userData.businesscategories.includes("Makeup Artist");

      // Check if businessImageStatus is true
      const hasBusinessImage = userData.businessImageStatus === true;

    const hasEmployees = userData.employees && userData.employees.length > 0;

      if (hasBarbershopOrSpa && hasBusinessImage && hasEmployees) {
        // Calculate Haversine distance between user and each location in the database
        const distance = haversineDistance(
          userLat,
          userLon,
          userData.location._latitude,
          userData.location._longitude
        );

        // Convert the distance to either kilometers or meters based on the threshold
        const formattedDistance =
          distance < 1
            ? `${(distance * 1000).toFixed(0)} Meter`
            : `${distance.toFixed(2)} KM`;

        // Add the calculated distance to the user data
        usersWithDistance.push({
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
          distance: formattedDistance,
          businessImageStatus: userData.businessImageStatus,
           latitudeOnDatabase: userData.location._latitude,
          longitudeOnDatabase: userData.location._longitude,
        });
      }
    });

    // Sort users by distance in ascending order
    usersWithDistance.sort((a, b) => {
      const [distanceA, unitA] = a.distance.split(" ");
      const [distanceB, unitB] = b.distance.split(" ");

      const numericDistanceA = parseFloat(distanceA);
      const numericDistanceB = parseFloat(distanceB);

      if (unitA === unitB) {
        return numericDistanceA - numericDistanceB;
      }

      // Convert both distances to the same unit (e.g., meters) for comparison
      const convertedDistanceA =
        unitA === "Meter" ? numericDistanceA : numericDistanceA * 1000;
      const convertedDistanceB =
        unitB === "Meter" ? numericDistanceB : numericDistanceB * 1000;

      return convertedDistanceA - convertedDistanceB;
    });

    // Calculate the start index and end index for the current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Extract the subset of users for the current page
    const paginatedUsers = usersWithDistance.slice(startIndex, endIndex);

    // Send the array of paginated user data as a JSON response
    res.json(paginatedUsers);
  } catch (error) {
    // Handle errors and send a 500 Internal Server Error response
    console.error("Error calculating distances:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
