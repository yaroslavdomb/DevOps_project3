import express from "express";
import { hotelRModel } from "../models/Hotel.js";
import * as validators from "../validators/hotel.js";

const router = express.Router();

// GET /api/v1/hotels
router.get("/", async (req, res) => {
    try {
        const hotels = await hotelRModel.find({}, { _id: 0, hotelId: 1, name: 1 }).limit(50);
        res.json(hotels);
    } catch (err) {
        console.error(`Search for all hotels data return error: ${err}`);
        res.status(500).json({ error: "Search for all hotels data failed!!!" });
    }
});

// GET /api/v1/hotels/{id}
router.get("/:id", validators.validateSearchHotel, async (req, res) => {
    try {
        const { id: hotelId } = req.params;
        const hotelData = await hotelRModel.findOne({ hotelId });
        if (!hotelData) {
            console.error(`Hotel with id=${req.params.id} not found!`);
            return res.status(404).json({ error: "Hotel not found!!!" });
        }
        res.json(hotelData);
    } catch (err) {
        console.error(`Search for id=${req.params.id} return error: ${err}`);
        res.status(500).json({ error: "DB data fetching error" });
    }
});

export default router;



