import mongoose from "mongoose";

export const globalRCon = mongoose.createConnection();
export const globalWCon = mongoose.createConnection();

export function initDatabase() {
    const uriBase = `${process.env.MONGO_URI}/${process.env.DATA_STORED}?authSource=${process.env.DATA_STORED}&replicaSet=${process.env.REPLICA}`;

    globalRCon.openUri(`mongodb://${process.env.READER_NAME}:${process.env.READER_PASS}@${uriBase}`);
    globalWCon.openUri(`mongodb://${process.env.WRITER_NAME}:${process.env.WRITER_PASS}@${uriBase}`);
}
