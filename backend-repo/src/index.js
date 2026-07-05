import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import reservationsRouter from "./routes/reservations.js";
import hotelsRouter from "./routes/hotels.js";
import { globalRCon, globalWCon, initDatabase } from "./models/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/reservations", reservationsRouter);
app.use("/api/v1/hotels", hotelsRouter);

app.get("/health/live", (req, res) => {
    res.json({ status: "alive" });
});

// Comments for testing-1
app.get("/health/ready", (req, res) => {
    const dbRead = globalRCon.readyState === 1;
    const dbWrite = globalWCon.readyState === 1;

    if (dbRead && dbWrite) {
        return res.status(200).json({ status: "ok", database: "connected" });
    } else {
        return res.status(500).json({
            status: "error",
            database: "disconnected",
            details: { hotelRead, resRead, resWrite }
        });
    }
});

const PORT = process.env.PORT || 3000;
try {
    initDatabase();

    app.listen(PORT, () => {
        console.log(`Application initialized. Listening port ${PORT}`);
    });
} catch (err) {
    console.error("Initialization error: " + err);
}
