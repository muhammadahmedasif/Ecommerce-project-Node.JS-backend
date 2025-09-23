import mylistModel from '../models/mylist.model.js';
import productModel from '../models/product.model.js';

export async function addtomylist(req, res) {
  try {
    const userid = req.userId;
    const productid = req.params.id;

    const product = await productModel.findById(productid);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    const mylistitem = await mylistModel.findOne({
      user_id: userid,
      product_id: product._id,
    });

    if (mylistitem) {
      return res.status(400).json({
        message: "Product already in the wishlist",
        error: true,
        success: false,
      });
    }

    const mylist = new mylistModel({
      user_id: userid,
      product_id: product._id,
    //   product: {
    //     _id: product._id,
    //     name: product.name,
    //     description: product.description,
    //     images: product.images,
    //     rating: product.rating,
    //     price: product.price,
    //     oldprice: product.oldprice,
    //     brand: product.brand,
    //     discount: product.discount,
    //   },
    });

    await mylist.save();

    return res.status(200).json({
      message: "Product added in the wishlist",
      error: false,
      success: true,
      data: mylist,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function deletefrommylist(req, res) {

    try {

        const userid = req.userId;
        const productid = req.params.id;

        const mylistitem = await mylistModel.find({
            user_id: userid,
            product_id: productid
        })

        if(!mylistitem){
            return res.status(404).json({
                message:"Invalid user_id or product_id",
                error: true,
                success: false
            })
        }

         const deletedlistitem = await mylistModel.deleteOne({
            user_id: userid,
            product_id: productid
        })

         return res.status(200).json({
                message:"item removed",
                Item: deletedlistitem,
                error: false,
                success: true
            })
        
    } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
    
}


export async function getallitemsinlist(req, res) {

    try {

        const userid = req.userId;

        const mylistitem = await mylistModel.find({
            user_id: userid,
        }).populate("product_id")

        if(!mylistitem){
            return res.status(404).json({
                message:"No items in the list",
                error: true,
                success: false
            })
        }

         return res.status(200).json({
                message:"Products in the list:",
                Item: mylistitem,
                error: false,
                success: true
            })
        
    } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
    
}