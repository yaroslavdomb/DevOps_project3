import Hotel from "../models/Hotel.js";
import Reservation from "../models/Reservation.js";

export const createReservationService = async (data, session) => {
    let { fullName, email, hotelId, hotelName, checkIn, checkOut, additionalReq } = data;

    const hotel = await Hotel.findOne({ hotelId: hotelId }).session(session);
    if (!hotel) {
        const error = new Error("Hotel not found");
        error.statusCode = 404;
        throw error;
    }

    if (!hotelName) {
        hotelName = hotel.name;
    }

    const occupiedRoomsNumber = await Reservation.countDocuments({
        hotelId: hotelId,
        checkInDate: { $lte: new Date(checkOut) },
        checkOutDate: { $gte: new Date(checkIn) }
    }).session(session);

    if (occupiedRoomsNumber >= hotel.rooms) {
        const error = new Error("Sorry, we have sold out! Please try other dates.");
        error.statusCode = 409;
        error.errorCode = "ROOMS_SOLD_OUT";
        throw error;
    }

    const reservation = new Reservation({
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
