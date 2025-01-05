const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // A
// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI, {
        dbName: "wedding", // Specify the database name
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err.message)); // Log error message

// Mongoose Schema and Model
const cardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    serialNo: { type: Number, required: true, unique: true },
    reference: { type: String },
    location: { type: String },
    holud: { type: Number },
    wedding: { type: Number },
    reception: { type: Number },
    telephone: { type: String },
    invited: { type: Boolean, default: false },
    invitedHolud: { type: Boolean, default: false }, // New field
    invitedWedding: { type: Boolean, default: false }, // New field
    invitedReception: { type: Boolean, default: false }, // New field
});

const Card = mongoose.model("Guest", cardSchema); // Use 'Guest' to refer to the 'guests' collection

// API Endpoints
app.post("/getAllGuests", async (req, res) => {
    try {
        const query = req.body.query;
        console.log(query);
        const guests = await Card.find(query || {});
        res.status(200).json(guests);
    } catch (err) {
        console.error("Error fetching guests:", err);
        res.status(500).json({
            message: "Failed to fetch guests",
            error: err.message,
        });
    }
});
// 1. Fetch All or Filtered Data
app.get("/api/cards", async (req, res) => {
    const { searchQuery = "", filterStatus = "all" } = req.query;

    try {
        const query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: "i" } },
                { reference: { $regex: searchQuery, $options: "i" } },
                { location: { $regex: searchQuery, $options: "i" } },
            ];
        }

        if (filterStatus !== "all") {
            query.invited = filterStatus === "invited";
        }

        console.log(`running the query`, {query2: JSON.stringify(query)});
        const cards = await Card.find(query);
        res.status(200).json(cards);
    } catch (err) {
        console.error("Error fetching cards:", err);
        res.status(500).json({
            message: "Failed to fetch cards",
            error: err.message,
        });
    }
});

// 2. Update Invitation Status
app.put("update/card", async (req, res) => {
    const { _id } = req.body;
    const updateData = req.body;

    try {
        const updatedCard = await Card.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if (!updatedCard) {
            return res.status(404).json({ message: "Card not found" });
        }
        res.status(200).json(updatedCard);
    } catch (err) {
        console.error("Error updating card:", err);
        res.status(500).json({
            message: "Failed to update card",
            error: err.message,
        });
    }
});

app.get("/health", (req, res) => {
    console.log("health check");
    res.status(200).json({ message: "Server is healthy" });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
