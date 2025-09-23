import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { countCategories, countSubCategories, createCategory, deletecategory, deletefromcloud, getallcategories, getcategorybyid, updatecategory } from "../controller/category.controller.js";
// import { createcategory, uploadImage } from "../controller/category.controller.js";

const categoryRouter = Router();


// categoryRouter.post('/imageupload', auth,upload.array('catagoryimages'), uploadImage);
// categoryRouter.post('/createcategory', auth,upload.array('catagoryimages'), createcategory
// );

categoryRouter.post('/createcategory', auth,upload.array('catagoryimages'), createCategory)
categoryRouter.get('/getall', getallcategories)
categoryRouter.get('/getcatcount', countCategories)
categoryRouter.get('/getsubcatcount', countSubCategories)
categoryRouter.get('/getcatbyid/:catid', getcategorybyid)
categoryRouter.delete('/deleteimage', auth, deletefromcloud)
categoryRouter.delete('/deletecategory/:id', auth, deletecategory)
categoryRouter.put('/categoryupdate/:id', auth,upload.array('catagoryimages'), updatecategory)


export default categoryRouter; 