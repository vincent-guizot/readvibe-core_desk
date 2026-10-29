import { Router } from "express";
const profileRouter = Router();
import { ProfileController } from "../controllers";

profileRouter.use("/", ProfileController.getAllProfile);
profileRouter.use("/details/:id", ProfileController.findById);
profileRouter.post("/create", ProfileController.create);
profileRouter.delete("/delete/:id", ProfileController.delete);
profileRouter.put("/update/:id", ProfileController.update);

export default profileRouter;
