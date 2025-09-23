import mongoose from "mongoose";


const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    oldprice: {
        type: Number,
        default: 0
    },
    catname: {
        type: String,
        default: ''
    },
    catId: {
        type: String,
        default: ''
    },
    subcatId: {
        type: String,
        default: ''
    },
    subcat: {
        type: String,
        default: ''
    },
    thirdsubcat: {
        type: String,
        default: ''
    },
    thirdsubcatId: {
        type: Number,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    countinstock: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    isfeatured: {
        type: Boolean,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    productram: [
        {
            type: String,
            default: null
        }
    ],
    size:{
        type: String,
        default: null
    },
    productweight:{
        type: String,
        default: null
    },
    datecreated: {
        type: Date,
        default: Date.now()
    }

}, {
    timestamps: true
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;