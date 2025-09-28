import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addaddress, deleteaddress, getalladdresses } from "../controller/address.controller.js";

const addressRouter = Router();

addressRouter.post('/addaddress', auth, addaddress);
addressRouter.delete('/deleteaddress/:id', auth, deleteaddress);
addressRouter.get('/getalladdresses', auth, getalladdresses);

export default addressRouter;
