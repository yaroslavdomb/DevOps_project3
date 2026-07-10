import express from "express";
import cors from "cors";
import reservationsRouter from "./routes/reservations.js";
import hotelsRouter from "./routes/hotels.js";
import { globalRCon, globalWCon, initDatabase } from "./models/db.js";
import logger, { loggerStorage } from "./config/logger.js";
import pinoHttp from "pino-http";

const app = express();

// init logger BEFORE all others to get access to body of POST 
const httpLogger = pinoHttp({ logger });
app.use((req, res, next) => {
    httpLogger(req, res, () => {
        loggerStorage.run({ logger: req.log }, next);
    });
});

// init middleware
app.use(cors());
app.use(express.json());

// init routers
app.use("/api/v1/reservations", reservationsRouter);
app.use("/api/v1/hotels", hotelsRouter);

app.get("/health/live", (req, res) => {
    res.json({ status: "alive" });
});

app.get("/health/ready", (req, res) => {
    const dbRead = globalRCon.readyState === 1;
    const dbWrite = globalWCon.readyState === 1;

    if (dbRead && dbWrite) {
        return res.status(200).json({ status: "ok", database: "connected" });
    } else {
        logger.error({dbRead, dbWrite}, "DB health check failed due to: ");
        
        return res.status(500).json({
            status: "error",
            database: "disconnected",
            details: { dbRead, dbWrite }
        });
    }
});

const PORT = process.env.PORT || 3000;
async function startServer () {
  try {
    logger.info("Before initDatabase - 4");
    await initDatabase();

    app.listen(PORT, () => {
      logger.info(`Backend initialized. Listening port ${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "DB initialization error: ");
  }
}

startServer();