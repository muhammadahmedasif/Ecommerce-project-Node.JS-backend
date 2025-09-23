import mongoose from "mongoose";

const mylistSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product_id:{
      type: mongoose.Schema.Types.ObjectId,
       ref: "Product",
      required: true
    }

    // embed product object commented this because it remains static if  we add a product then after the  updation of the product will not be reflected here so i referenced only id so it will remains updated
    // product: {
    //   _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    //   name: { type: String, required: true },
    //   description: {type: String, required: true},
    //   images: [{ type: String, required: true }],
    //   rating: { type: Number, required: true },
    //   price: { type: Number, required: true },
    //   oldprice: { type: Number, required: true },
    //   brand: { type: String, required: true },
    //   discount: { type: Number, required: true },
    // },
  },
  { timestamps: true }
);

const mylistModel = mongoose.model("Mylist", mylistSchema);

export default mylistModel;
