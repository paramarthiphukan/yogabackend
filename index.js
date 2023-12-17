// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose schema
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  selectedBatch: String,
  paymentStatus: Boolean,
  enrolledMonth: Number,
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Mock function for payment processing
const completePayment = async (userId) => {
  // Simulate payment processing logic
  // In a real scenario, you would integrate with a payment gateway here

  // For simplicity, let's assume the payment is successful
  return true;
};

// API route to handle user enrollment with payment
app.post("/api/enroll", async (req, res) => {
  try {
    // Validate user data
    const { name, age, selectedBatch } = req.body;

    if (!name || !age || !selectedBatch) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    // Check age eligibility
    if (age < 18 || age > 65) {
      return res
        .status(400)
        .json({ error: "Age must be between 18 and 65 to enroll." });
    }

    // Check if the selected batch is valid
    const validBatches = ["6-7AM", "7-8AM", "8-9AM", "5-6PM"];
    if (!validBatches.includes(selectedBatch)) {
      return res.status(400).json({ error: "Invalid batch selection." });
    }

    // Store user data in MongoDB
    const newUser = new User({ name, age, selectedBatch });
    await newUser.save();

    // Perform payment
    const paymentStatus = await completePayment(newUser._id);

    // Update user payment status and enrollment details in the database
    if (paymentStatus) {
      await User.findByIdAndUpdate(newUser._id, {
        paymentStatus: true,
        enrolledMonth: new Date().getMonth() + 1, // Store the month of enrollment
      });
      res
        .status(200)
        .json({ data: "Enrollment successful. Payment completed." });
    } else {
      res.status(500).json({ error: "Payment failed." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
