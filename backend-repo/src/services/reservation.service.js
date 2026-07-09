import logger from "../config/logger.js";
import { hotelWModel } from "../models/Hotel.js";
import { reservationWModel } from "../models/Reservation.js";
import mongoose from "mongoose";

export const createReservationService = async (data, session) => {
    let { fullName, email, hotelId, hotelName, checkIn, checkOut, additionalReq } = data;

    const hotel = await hotelWModel.findOne({ hotelId: hotelId }).session(session);
    if (!hotel) {
        const error = new Error("Hotel not found");
        error.statusCode = 404;
        logger.warn({ hotelId }, "Hotel was not found: ");
        throw error;
    }

    if (!hotelName) {
        hotelName = hotel.name;
    }

    const occupiedRoomsNumber = await reservationWModel
        .countDocuments({
            hotelId: hotelId,
            checkInDate: { $lte: new Date(checkOut) },
            checkOutDate: { $gte: new Date(checkIn) }
        })
        .session(session);

    if (occupiedRoomsNumber >= hotel.rooms) {
        const error = new Error("Sorry, we have sold out! Please try other dates.");
        error.statusCode = 409;
        error.errorCode = "ROOMS_SOLD_OUT";
        logger.warn({ hotelName, checkIn, checkOut }, "No rooms for these dates left!");
        throw error;
    }

    const reservation = new reservationWModel({
        fullName,
        email,
        hotelId,
        hotelName,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        additionalReq
    });

    await reservation.save({ session });
    return reservation._id;
};
