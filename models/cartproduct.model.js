import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},
    {
        timestamps: true,
    }
);

const CartModel = mongoose.model("Cart", cartSchema);

export default CartModel;