import express from "express";
import Reservation from "../models/Reservation.js";
import * as validators from "../validators/reservation.js";
import { createReservationService } from "../services/reservation.service.js";

const router = express.Router();

// POST /api/v1/reservations
router.post("/", validators.validateSaveReservation, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservationID = await createReservationService(req.body, session);
        await session.commitTransaction();
        return res.status(201).json({ message: "Reservation created", id: reservationID });
    } catch (err) {
        await session.abortTransaction();

        if (err.statusCode) {
            return res.status(err.statusCode).json({
                success: false,
                ...(err.errorCode && { errorCode: err.errorCode }),
                message: err.message
            });
        }

        return res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

// GET /api/v1/reservations?email=...&fullName=...
router.get("/", validators.validateSearchReservation, async (req, res) => {
    try {
        const { email, fullName } = req.query;
        const searchCriterias = {};
        if (email) searchCriterias.email = email;
        if (fullName) searchCriterias.fullName = fullName;

        const reservations = await Reservation.find(searchCriterias);
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/v1/reservations/:id
router.delete("/:id", validators.validateDeleteReservation, async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) return res.status(404).json({ error: "Reservation not found" });

        res.json({ message: "Reservation cancelled" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
