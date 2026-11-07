import express from "express";
import type { Request, Response } from "express";
import { pool } from "./db.ts";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "payment-api is running now" });
});

app.get("/health", async (req: Request, res: Response) => {

    try {
        await pool.query("SELECT 1");
        res.json({ status: "ok", database: "up" });
    }catch (err) {
        res.status(503).json({ status: "error", database: "down" });
    }
});





app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});