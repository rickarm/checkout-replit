import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { journalRouter } from "./journal";
import { templateRouter } from "./template";

const router: IRouter = Router();

router.use(healthRouter);
router.use(journalRouter);
router.use(templateRouter);

export default router;
