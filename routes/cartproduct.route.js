import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addprooducttocart, deletecartitem, getallcartitems, updatecartproducts } from "../controller/cartproduct.controller.js";

const cartRouter = Router();

cartRouter.post('/addproducttocart', auth, addprooducttocart);
cartRouter.get('/getcartproducts', auth, getallcartitems);
cartRouter.put('/updatecart/:id', auth, updatecartproducts)
cartRouter.delete('/deletecart/:id', auth, deletecartitem)


export default cartRouter;