import type { Request, Response, NextFunction } from "express";


export function notFound(req: Request, res: Response){
    res.status(404).json({ error: "Route not found" });
};
