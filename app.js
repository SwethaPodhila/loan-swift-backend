const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const loanRoutes = require("./routes/loanRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const connectDB = require("./config/db"); // import DB config

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/loans", loanRoutes);
app.use("/auth", adminAuthRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Loan Application API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});