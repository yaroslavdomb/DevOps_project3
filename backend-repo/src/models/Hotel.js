import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
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
    name: { type: String, required: true },
    rooms: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value"
        }
    },
    photo: { type: String },
    description: { type: String },
    location: { type: String },
    price: { type: Number }
});

export default mongoose.model("Hotel", hotelSchema);
