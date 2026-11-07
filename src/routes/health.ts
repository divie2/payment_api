import { Router } from "express";
import { pool } from "../db.ts";
import type { Request, Response } from "express";


export const healthRouter = Router();


healthRouter.get("/", async (req: Request, res: Response) => {

    try {
        await pool.query("SELECT 1");
        res.json({ status: "ok", database: "up" });
    }catch (err) {
        res.status(503).json({ status: "error", database: "down" });
    }
});
