const dotenv = require("dotenv");

const express = require("express"); // importing express module from node modules and returns a express function , use to create server/applications
const cors = require("cors"); // to prevent CORS blocking by browser
const cookieParser = require("cookie-parser"); // allow cookies
const app = express(); // creating express application instance
dotenv.config();
const setupSwagger = require("./swagger/swagger");
app.use(express.json()); //  express by default doesn't understand raw incoming JSON data from client or frontend , so this middleware parse the JSON to js object and put inside the req.body /;
app.use(cookieParser()); //
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(
  cors({ origin: "http://lap-tracker-web-1.vercel.app", credentials: true })
);

// Import session routes

const sessionRoutes = require("./routes/sessionRoutes");
const getsessionDetails = require("./routes/getsessionDetails");
const userFilters = require("./routes/userFilters");
const authRoutes = require("./routes/authRoutes");
const deleteRoutes = require("./routes/deleteRoutes");
const adminOnly = require("./routes/admin");
const PORT = process.env.MYSQLPORT || 8000;

app.get("/", (req, res) => {
  res.send("Lap tracker Api is running..");
});
app.use("/api", getsessionDetails);
app.use("/api/filter", userFilters);
app.use("/api/auth", authRoutes);
app.use("/api", deleteRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/admin", adminOnly);

setupSwagger(app);
app.listen(PORT, () => {
  // start server
  // tells to the express app to listen for incoming requests and server is running on the 2000 port number
  console.log(`server is running on the ${PORT}`);
});
