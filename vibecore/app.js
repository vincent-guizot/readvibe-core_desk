import { config } from "dotenv";
config();
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3360;

// Allowed development origins (ReadVibe: 3350, VibeDesk: 3355)
const defaultOrigins = ["http://localhost:3350", "http://localhost:3355"];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, mobile, server-side)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import routes from "./routes";
app.use(routes);

app.listen(port, () => console.log(`VibeCore API listening on port ${port}`));
