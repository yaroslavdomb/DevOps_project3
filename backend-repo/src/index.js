import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import reservationsRouter from "./routes/reservations.js";
import hotelsRouter from "./routes/hotels.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/reservations", reservationsRouter);
app.use("/api/v1/hotels", hotelsRouter);

//check Liveness - Node.js is alive
app.get("/health/live", (req, res) => {
    res.json({ status: "alive" });
});

//check Readiness - DB is ready
app.get("/health/ready", async (req, res) => {
    const isDbHealthy = mongoose.connection.readyState === 1;
    if (isDbHealthy) {
        return res.status(200).json({ status: "ok", database: "connected" });
    } else {
        return res.status(500).json({ status: "error", database: "disconnected" });
    }
});

const PORT = process.env.PORT || 3000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT))
    .then(() => console.log(`Connected to DB. Listening port ${PORT}`))
    .catch((err) => console.error("DB connection error: " + err));
