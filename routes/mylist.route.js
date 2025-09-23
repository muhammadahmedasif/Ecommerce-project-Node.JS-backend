import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addtomylist, deletefrommylist, getallitemsinlist } from "../controller/mylist.controller.js";

const mylistRouter = Router();

mylistRouter.post('/addtomylist/:id', auth, addtomylist);
mylistRouter.delete('/deletefromlist/:id', auth, deletefrommylist);
mylistRouter.get('/getallitems', auth, getallitemsinlist);

export default mylistRouter;
