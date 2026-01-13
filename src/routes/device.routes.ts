import { Hono } from "hono";
import { addLoggedInDevice, getLoggedInDevices, removeLoggedInDevice } from "../controllers/device.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const loggedInDeviceRoutes = new Hono();


loggedInDeviceRoutes.post("/", isAuthenticated,addLoggedInDevice);
loggedInDeviceRoutes.get("/", isAuthenticated,getLoggedInDevices);
loggedInDeviceRoutes.delete("/", isAuthenticated,removeLoggedInDevice);

export default loggedInDeviceRoutes;