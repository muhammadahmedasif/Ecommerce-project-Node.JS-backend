import mongoose from "mongoose";

const addressSchema = mongoose.Schema({

    address: {
        type: String,
        default: "",
        required: [true, "Please Provide Address"],
    },
    city: {
        type: String,
        default: "",
        required: [true, "Please Provide city"],
    },
    state: {
        type: String,
        default: "",
        required: [true, "Please Provide State"],
    },
    pincode: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
        required: [true, "Please Provide Country"],
    },
    mobile: {
        type: Number,
       required: [true, "Please Provide Country"],
    },
    status: {
        type: Boolean,
        default: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true,
    }
);

const AddressModel = mongoose.model("Address", addressSchema);

export default AddressModel;