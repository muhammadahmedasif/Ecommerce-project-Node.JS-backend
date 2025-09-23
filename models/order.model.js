import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    order_id: {
        type: String,
        required: [true, "Please Provide Order ID"],
        unique: true,
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    product_details: {
        name: String,
        image: Array,
    },
    payment_id: {
        type: String,
        default: "",
    },
    payment_status: {
        type: String,
        default: "",
    },
    delivery_address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    subtotal: {
        type: Number,
        default: 0,
    },
    totalamount: {
        type: Number,
        default: 0,
    }
},
    {
        timestamps: true,
    }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;