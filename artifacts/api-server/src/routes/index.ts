import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { journalRouter } from "./journal";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/journal", journalRouter);

export default router;
