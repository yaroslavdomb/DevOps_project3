import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    hotelId: { type: String, required: true },
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
    description: { type: String }
});

export default mongoose.model("Hotel", hotelSchema);
