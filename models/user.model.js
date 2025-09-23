import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please Provide Name"],
        },
        nickname: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Please Provide Email"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please Provide Password"],
        },
        avatar: {
            type: String,   // for frontend display 
            default: "/images.png",
        },
        avatarPublicId: [{
            type: String,  // stores Cloudinary public_id for deletion
            default: "",
        }],
        mobile: {
            type: String,
            default: null,
        },
        verify_email: {
            type: Boolean,
            default: false,
        },
        access_token: {
            type: String,
            default: "",
        },
        refresh_token: {
            type: String,
            default: "",
        },
        last_login_date: {
            type: Date,
            default: "",
        },
        status: {
            type: String,
            enum: ["Active", "In Active", "Suspended"],
            default: "Active",
        },
        address_details: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],
        shopping_cart: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Cartproduct",
            },
        ],
        order_history: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
        otp: {
            type: String,
        },
        otpexpiry: {
            type: Date,
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
        },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;