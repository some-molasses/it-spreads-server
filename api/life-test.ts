import { Router } from "express";

const router = Router();

router.get("/life-test", (req, res) =>
  res.json({ isAlive: true }).status(200).send()
);

export default router;
