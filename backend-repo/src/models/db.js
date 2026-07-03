import mongoose from "mongoose";

export const globalRCon = mongoose.createConnection();
export const globalWCon = mongoose.createConnection();

export function initDatabase() {
    const dbAddress = `${process.env.DB_HOST}:${process.env.DB_PORT}`;
    const uriBase = `${dbAddress}/${process.env.DB_NAME}?authSource=${process.env.DB_NAME}&replicaSet=${process.env.REPLICA}`;

    globalRCon.openUri(`mongodb://${process.env.READER_NAME}:${process.env.READER_PASS}@${uriBase}`);
    globalWCon.openUri(`mongodb://${process.env.WRITER_NAME}:${process.env.WRITER_PASS}@${uriBase}`);
}
