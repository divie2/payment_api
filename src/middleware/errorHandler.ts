import type {Request, Response, NextFunction} from "express"


export function errHandler(err: unknown, req: Request, res: Response, next: NextFunction){
 console.error(err);                                     // full details in YOUR logs
  res.status(500).json({ error: "Internal server error" }); // nothing sensitive for users

};
