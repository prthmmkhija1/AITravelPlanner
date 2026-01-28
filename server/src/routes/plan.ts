import express from "express";

import { planTrip } from "../agent/index.js";

export const planRouter = express.Router();

planRouter.post("/plan", async (req, res) => {
  const request = typeof req.body?.request === "string" ? req.body.request : "";

  if (!request.trim()) {
    res.status(400).json({ status: "error", error_message: "Missing request" });
    return;
  }

  const result = await planTrip(request);
  res.json(result);
});

