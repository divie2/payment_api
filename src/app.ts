import express from "express";
import type { Request, Response } from "express";
import { healthRouter } from "./routes/health.ts";

export const app = express();

app.use(express.json());


app.get("/", (req: Request, res: Response) => {
    res.json({ message: "payment-api is running now" });
});

app.use("/health", healthRouter);
