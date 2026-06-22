import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    hotelId: {
        type: Number,
        ref: "Hotel",
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value"
        }
    },
    hotelName: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    additionalReq: { type: String }
});

export default mongoose.model("Reservation", reservationSchema);
