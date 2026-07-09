import express from "express";
import logger from "../config/logger.js";
import { hotelRModel } from "../models/Hotel.js";
import * as validators from "../validators/hotel.js";

const router = express.Router();

// GET /api/v1/hotels
router.get("/", async (req, res) => {
    try {
        const hotels = await hotelRModel.find({}, { _id: 0, hotelId: 1, name: 1 }).limit(50);
        res.json(hotels);
    } catch (err) {
        logger.error({ err }, "Search for all hotels data return error:... ");
        res.status(500).json({ error: "Search for all hotels data failed!" });
    }
});

// GET /api/v1/hotels/{id}
router.get("/:id", validators.validateSearchHotel, async (req, res) => {
    try {
        const { id: hotelId } = req.params;
        const hotelData = await hotelRModel.findOne({ hotelId });
        if (!hotelData) {
            logger.warn({ id: req.params.id }, "Hotel with specific ID not found");
            return res.status(404).json({ error: "Hotel not found!" });
        }
        res.json(hotelData);
    } catch (err) {
        logger.error({ err, id: req.params.id }, "Search hotel by its ID failed: ");
        res.status(500).json({ error: "Search hotel by its ID failed!" });
    }
});

export default router;
