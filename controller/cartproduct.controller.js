import CartModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import productModel from '../models/product.model.js ';

export async function addprooducttocart(req, res) {

    try {

        const user = await UserModel.findById(req.userId)
        const { productid } = req.body
        const product = await productModel.findById(productid)

        if (!product || !user) {
            return res.status(400).json({
                message: !product ? "No product Found" : "No user found",
                success: false,
                error: true,
            })
        }


        const existingCartItem = await CartModel.findOne({
            user_id: user._id,
            product_id: product._id,
        });

        if (existingCartItem) {
            return res.status(400).json({
                message: "Product already in cart",
                success: false,
                error: true,
            })
        }

        const cartitem = new CartModel({
            user_id: user._id,
            quantity: 1,
            product_id: product._id
        })

        const data = await cartitem.save();

        await UserModel.updateOne(
            { _id: user._id },
            { $push: { shopping_cart: product._id } }
        );

        return res.status(200).json({
            message: "Product created",
            success: true,
            error: false,
            data: data,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }

}

export async function getallcartitems(req, res) {

    try {

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({
                message: "No User found!",
                error: true,
                success: false,
            })
        }

        const cartitems = await CartModel.find({ user_id: user._id })
            .populate('product_id')   // product details
            .populate('user_id');

        if (!cartitems) {
            return res.status(400).json({
                message: "No item in cart!",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            message: "cart items are",
            cartitems: cartitems,
            error: false,
            success: true,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }

}

export async function updatecartproducts(req, res) {
    try {
        const productid = req.params.id;
        const { quantity } = req.body;

        if (!productid || !quantity) {
            return res.status(400).json({
                message: "Product ID and quantity are required",
                success: false,
                error: true,
            });
        }

        // Find the cart item for this user + product
        const cartitem = await CartModel.findOne({
            user_id: req.userId,
            product_id: productid,
        }).populate('product_id');

        if (!cartitem) {
            return res.status(404).json({
                message: "No cart item found for this user and product",
                success: false,
                error: true,
            });
        }

        // Update quantity
        cartitem.quantity = quantity;
        await cartitem.save();

        return res.status(200).json({
            message: "Cart updated successfully",
            cartitem,
            success: true,
            error: false,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true,
        });
    }
}
export async function deletecartitem(req, res) {
    try {
        const productid = req.params.id;

        if (!productid) {
            return res.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true,
            });
        }

        // Find the cart item for this user + product
        const cartitem = await CartModel.findOne({
            user_id: req.userId,
            product_id: productid,
        }).populate('product_id');

        if (!cartitem) {
            return res.status(404).json({
                message: "No cart item found for this user and product",
                success: false,
                error: true,
            });
        }

        // Update quantity
        await CartModel.deleteOne({ _id: cartitem._id })

        const user = await UserModel.findById(req.userId);

        const shoppingcartitems = user.shopping_cart;

        const updatedshoppingcartitems = [
            ...shoppingcartitems.slice(0, shoppingcartitems.indexOf(productid)),
            ...shoppingcartitems.slice(shoppingcartitems.indexOf(productid) + 1)
        ]

        user.shopping_cart = updatedshoppingcartitems;

        await user.save()

        return res.status(200).json({
            message: "Cart item deleted successfully",
            cartitem,
            success: true,
            error: false,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            success: false,
            error: true,
        });
    }
}
