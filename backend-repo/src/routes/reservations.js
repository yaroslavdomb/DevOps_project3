import express from "express";
import mongoose from "mongoose"
import logger from "../config/logger.js";
import { globalWCon } from "../models/db.js";
import { reservationRModel, reservationWModel } from "../models/Reservation.js";
import * as validators from "../validators/reservation.js";
import { createReservationService } from "../services/reservation.service.js";

const router = express.Router();

// POST /api/v1/reservations
router.post("/", validators.validateSaveReservation, async (req, res) => {

    const session = await globalWCon.startSession();
    session.startTransaction();

    try {
        const reservationID = await createReservationService(req.body, session);
        await session.commitTransaction();
        return res.status(201).json({ message: "Reservation created", id: reservationID });
    } catch (err) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }

        if (err.statusCode) {
          logger.warn({ body: req.body, err }, "Not able to create reservation: ");
          return res.status(err.statusCode).json({
              success: false,
              ...(err.errorCode && { errorCode: err.errorCode }),
              message: err.message
          });
        }

        logger.error({ body: req.body, err }, "Creation reservation failed: ");
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

        const reservations = await reservationRModel.find(searchCriterias).select("-__v");
        res.json(reservations);
    } catch (err) {
        logger.error({ email, fullName, err }, "GET reservation failed: ");
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/v1/reservations/:id
router.delete("/:id", validators.validateDeleteReservation, async (req, res) => {
    try {
        const reservation = await reservationWModel.findByIdAndDelete(req.params.id);
        
        if (!reservation) {
          logger.warn({ id: req.params.id }, "Not able to delete an absent reservation: ");
          return res.status(404).json({ error: "Reservation not found" });
        }

        res.json({ message: "Reservation cancelled" });
    } catch (err) {
        logger.error({ err, id: req.params.id }, "Reservation deletion failed: ");
        res.status(500).json({ error: err.message });
    }
});

export default router;
