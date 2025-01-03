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
        // Use environment variable
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
    holud: { type: String },
    wedding: { type: String },
    reception: { type: String },
    telephone: { type: String },
    invited: { type: Boolean, default: false },
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
app.put("/api/cards/:id", async (req, res) => {
    const { id } = req.params;
    const { invited } = req.body;

    try {
        const updatedCard = await Card.findOneAndUpdate(
            { serialNo: id },
            { invited },
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
const PORT = 5002;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
