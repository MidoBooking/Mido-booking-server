const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();
const cron = require("node-cron");
const PORT = 9900;
// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require("./gizeye-firebase-adminsdk.json"); // Replace with your own service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "mido-6da6b.appspot.com",
  databaseURL: "https://bafta-27898-default-rtdb.firebaseio.com", // Replace with your Firestore database URL
});
app.use(cors());
// Middleware
app.use(express.static("public"));
app.use(express.json()); // Middleware to parse JSON requests

const firestore = admin.firestore();

app.get("/server", (req, res) => {
  res.send("server is running");
});
cron.schedule("* * * * *", async () => {
  console.log("Running deletion task...");
  try {
    const snapshot = await firestore.collection("bookings").get();
    const fifteenMinutesAgo = Math.floor(Date.now() / 1000) - 15 * 60; // 15 minutes before the current time

    snapshot.forEach((doc) => {
      const bookingData = doc.data();
      console.log(bookingData);
      console.log(`Current Time: ${new Date()}`);
      if (bookingData.updatedAt) {
        if (
          bookingData.approved === true &&
          bookingData.payment === false &&
          bookingData.updatedAt._seconds <= fifteenMinutesAgo
        ) {
          console.log(`Booking eligible for deletion: ${doc.id}`);
          doc.ref
            .delete()
            .then(() => {
              console.log(`Expired booking deleted: ${doc.id}`);
            })
            .catch((error) => {
              console.error("Error deleting booking:", error);
            });
        } else {
          console.log(`Booking not eligible for deletion: ${doc.id}`);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
});
// Routes
const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users");
const categoriesRoute = require("./routes/businessCategories");
const registerRoute = require("./routes/register");
const servicesRoute = require("./routes/service");
const setWorkingHours = require("./routes/workingHours");
const uploadImage = require("./routes/uploadImage");
const businessImage = require("./routes/businessImage");
const getImages = require("./routes/getImages");
const serviceProvider = require("./routes/serviceProviders");
const setBooking = require("./routes/setBooking");
const fetchBooking = require("./routes/fetchBooking");
const fetchBookingById = require("./routes/fetchBookingById");
const fetchClients = require("./routes/fetchClients");
//payment
//const teleBirr = require("./routes/teleBirr");
const deleteBooking = require("./routes/deleteBooking");
const updateBooking = require("./routes/updateBooking");
const clientRegister = require("./routes/clientRegister");
const marketing = require("./routes/SMS/marketing");
//bulk sms
const bulkSMS = require("./routes/SMS/bulkSMS");

const uploadPortfolioImages = require("./routes/uploadPortfolioImages");
const updateClient = require("./routes/Clients/updateClient");

const deleteServiceProvider = require("./routes/serviceProvider/deleteServiceProvider");
const editServiceProviderHour = require("./routes/serviceProvider/editServiceProviderHour");
const updateLocation = require("./routes/serviceProvider/updateLocation");
const finishBooking = require("./routes/Booking/finishBooking");
const filteredUser = require("./routes/filteredUser");
const manageServices = require("./routes/ManageBusiness/manageServices");
const clientsProfileImages = require("./routes/Clients/clientProfileImage");
const clientsData = require("./routes/Clients/clientsData");
const bookingConfirmation = require("./routes/SMS/bookingConfirmation");
//filtered uses
const barbershopUsers = require("./routes/filteredUsers/barbershopUser");
const bridalUses = require("./routes/filteredUsers/bridalserviceUsers");
const makeupUsers = require("./routes/filteredUsers/makeupUsers");
const massageUsers = require("./routes/filteredUsers/massageUsers");
const nailUsers = require("./routes/filteredUsers/nailUsers");
const skincareUses = require("./routes/filteredUsers/skincareUsers");
const spaUsers = require("./routes/filteredUsers/spaUsers");
const handAndFoot = require("./routes/filteredUsers/handAndFoot");
//waiting list sms
const waitingListConfirmation = require("./routes/SMS/waitingListConfirmation");
// client contacts
const clientContacts = require("./routes/SMS/clientContacts");
//telebirr
//telebirr
const telebirr = require("./routes/Payment/payment");
//edit booking
const editBooking = require("./routes/Booking/editBooking");

const Booking = require("./routes/Booking/bookingById");
//register and login
const sendOTP = require("./routes/SMS/sendOTP");
const registerOTP = require("./routes/SMS/registerOTP");
//login and register for service provider
const serviceProviderLogin = require("./routes/SMS/serviceProviderLogin");
const serviceProviderRegister = require("./routes/SMS/serviceProviderRegister");
//register and login for employees
const employeeRegister = require("./routes/SMS/employeeRegister");
const employeeLogin = require("./routes/SMS/employeeLogin");
//all users
const allUsers = require("./routes/filteredUsers/allUsers");
//Analytics
const paymentAnalytics = require("./routes/Analytics/paymentAnalytics");
app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/", categoriesRoute);
app.use("/", registerRoute);
app.use("/", servicesRoute);
app.use("/", setWorkingHours);
app.use("/", uploadImage);
app.use("/", businessImage);
app.use("/", getImages);
app.use("/", serviceProvider);
app.use("/", setBooking);
app.use("/", fetchBooking);
app.use("/", fetchBookingById);
app.use("/", fetchClients);
app.use("/", deleteBooking);
app.use("/", updateBooking);
app.use("/", clientRegister);
app.use("/", marketing);
//bulksms
app.use("/", bulkSMS);
app.use("/", uploadPortfolioImages);
app.use("/", updateClient);
app.use("/", deleteServiceProvider);
app.use("/", editServiceProviderHour);
app.use("/", updateLocation);
app.use("/", filteredUser);
app.use("/", finishBooking);
app.use("/", manageServices);
app.use("/", clientsProfileImages);
app.use("/", clientsData);
app.use("/", bookingConfirmation);

//filtered users
app.use("/", barbershopUsers);
app.use("/", bridalUses);
app.use("/", makeupUsers);
app.use("/", massageUsers);
app.use("/", nailUsers);
app.use("/", skincareUses);
app.use("/", spaUsers);
app.use("/", handAndFoot);

//waiting list sms
app.use("/", waitingListConfirmation);
//clientContats
app.use("/", clientContacts);

//telebirr
app.use("/", telebirr);

//editbooking
app.use("/", editBooking);
app.use("/", Booking);
//register and login
app.use("/", sendOTP);
app.use("/", registerOTP);
//login and register for service providers
app.use("/", serviceProviderLogin);
app.use("/", serviceProviderRegister);
//register for employees
app.use("/", employeeRegister);
app.use("/", employeeLogin);
//all users
app.use("/", allUsers);
//Payment analytics
app.use("/", paymentAnalytics);
// Start the server
app.listen(PORT, (err) => {
  console.log(`Your dog server is up and running!`);
});
