import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createProduct, deleteimagesfromcloud, deleteproduct, filterbyprice, getallfeaturedproducts, getallproducts, getproductbycatid, getproductbycatname, getproductbyrating, getproductbysubcatid, getproductbysubcatname, getproductbythirdsubcat, getproductbythirdsubid, getproductcount, getsingleproduct, updateproduct } from "../controller/product.controller.js";

// import { createcategory, uploadImage } from "../controller/category.controller.js";

const productRouter = Router();

productRouter.post(
  '/createproduct',
  auth,
  upload.array('productimages'),
  createProduct
);

productRouter.get('/getallproducts', getallproducts);
productRouter.get('/getproductsbycatid/:catid', getproductbycatid);
productRouter.get('/getproductsbycatname', getproductbycatname);
productRouter.get('/getproductsbysubcatid/:subcatid', getproductbysubcatid);
productRouter.get('/getproductsbysubcat', getproductbysubcatname);
productRouter.get('/getproductsbythirdsubcatid/:thirdsubcatid', getproductbythirdsubid);
productRouter.get('/getproductsbythirdsubcat', getproductbythirdsubcat);
productRouter.get('/getproductsbyprice', filterbyprice);
productRouter.get('/getproductsbyrating', getproductbyrating);
productRouter.get('/getproductscount', getproductcount);
productRouter.get('/getallfeaturedproducts', getallfeaturedproducts);
productRouter.delete('/deletedproduct/:id', auth, deleteproduct);
productRouter.get('/getsingleproduct/:id', auth, getsingleproduct);
productRouter.delete('/deletefromcloud', auth, deleteimagesfromcloud);
productRouter.put('/updateproduct/:id', auth,  upload.array("images"), updateproduct);

export default productRouter;