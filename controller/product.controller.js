import productModel from '../models/product.model.js ';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import categoryModel from '../models/catagory.model.js';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

async function deleteImages(images) {
    if (!images || images.length === 0) return [];

    const results = [];

    for (let img of images) {
        try {
            const URLarray = img.split("/");
            const image = URLarray[URLarray.length - 1];
            const imagename = image.split(".")[0];

            const resource = await cloudinary.api.resource(imagename).catch(() => null);

            if (!resource) {
                results.push({
                    url: img,
                    message: `No image found with url ${img} or name ${imagename}`,
                    error: true,
                    success: false,
                });
                continue;
            }

            await cloudinary.uploader.destroy(imagename);
            results.push({
                url: img,
                message: `Image ${imagename} deleted`,
                error: false,
                success: true,
            });

        } catch (err) {
            results.push({
                url: img,
                message: err.message || "Failed to delete",
                error: true,
                success: false,
            });
        }
    }

    return results;
}

async function deleteProductRecursive(product) {

    // Delete this category's images
    await deleteImages(product.images);

    // Delete this category itself
    const deletedproduct = await productModel.findByIdAndDelete(product._id);

    return deletedproduct;
}

function cleanupLocalFiles(files) {
    if (files && files.length > 0) {
        for (let f of files) {
            try {
                fs.unlinkSync(f.path);
            } catch (err) {
                console.error("Error deleting local file:", f.path, err.message);
            }
        }
    }
}

export async function createProduct(req, res) {
    try {

        const { name, description, brand, price, oldprice, catname, catid, subcatid, subcat, thirdsubcat, thirdsubcatid, countinstock, rating, isfeatured, discount, productram, size, productweight } = req.body;

        if (!name || !description || !brand || !catname || !catid || !subcatid || !subcat) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Missing required product fields",
                error: true,
                success: false,
            });
        }
        const category = await categoryModel.findById(catid);

        if (!category) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Category not found",
                error: true,
                success: false,
            });
        }

        if (category.name !== catname) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Category ID and Category Name do not match",
                error: true,
                success: false,
            });
        }

        const subCategory = await categoryModel.findById(subcatid);

        if (!subCategory) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Subcategory not found",
                error: true,
                success: false,
            });
        }

        if (subCategory.name !== subcat) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Subcategory ID and Subcategory Name do not match",
                error: true,
                success: false,
            });
        }

        const existingProduct = await productModel.findOne({
            name: name,
            catId: catid,
            subcatId: subcatid,
        });

        if (existingProduct) {
            cleanupLocalFiles(req.files);
            return res.status(400).json({
                message: "Product with this name already exists in the same category / subcategory",
                error: true,
                success: false,
            });
        }


        const uploadedImages = [];

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let f of req.files) {
            const result = await cloudinary.uploader.upload(f.path, options);
            uploadedImages.push(result.secure_url);

            // remove local file
            fs.unlinkSync(f.path);
        }

        const product = new productModel({
            name: name,
            description: description,
            images: uploadedImages,
            brand: brand,
            price: price,
            oldprice: oldprice,
            catname: catname,
            catId: catid,
            subcatId: subcatid,
            subcat: subcat,
            thirdsubcat: thirdsubcat,
            thirdsubcatId: thirdsubcatid,
            countinstock: countinstock,
            rating: rating,
            isfeatured: isfeatured,
            discount: discount,
            productram: productram,
            size: size,
            productweight: productweight
        });
        await product.save();

        return res.status(200).json({
            message: "Product Created",
            error: false,
            success: true,
        })


    } catch (error) {
        cleanupLocalFiles(req.files);
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

export async function updateproduct(req, res) {
    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            cleanupLocalFiles(req.files)
            return res.status(404).json({
                message: "Product not found, can't update",
                error: true,
                success: false,
            });
        }

        const {
            name,
            description,
            brand,
            price,
            oldprice,
            catname,
            catid,
            subcatid,
            subcat,
            thirdsubcat,
            thirdsubcatid,
            countinstock,
            rating,
            isfeatured,
            discount,
            productram,
            size,
            productweight,
        } = req.body;

        // === Simple field updates ===
        if (name) product.name = name;
        if (description) product.description = description;
        if (brand) product.brand = brand;
        if (price) product.price = price;
        if (oldprice) product.oldprice = oldprice;
        if (countinstock) product.countinstock = countinstock;
        if (rating) product.rating = rating;
        if (typeof isfeatured !== "undefined") product.isfeatured = isfeatured;
        if (discount) product.discount = discount;
        if (productram) product.productram = productram;
        if (size) product.size = size;
        if (productweight) product.productweight = productweight;

        // === Category & Subcategory validation ===
        let category = null;
        let subCategory = null;

        if (catid || catname) {
            if (catid) {
                category = await categoryModel.findById(catid);
                if (!category) {
                    cleanupLocalFiles(req.files);
                    return res.status(400).json({
                        message: "Category not found",
                        error: true,
                        success: false,
                    });
                }
                product.catId = catid;
            }

            if (catname) {
                category = await categoryModel.findOne({ name: catname });
                if (!category) {
                    cleanupLocalFiles(req.files);
                    return res.status(400).json({
                        message: "Category not found",
                        error: true,
                        success: false,
                    });
                }
                product.catname = catname;
            }

            // Cross check if both provided
            if (catid && catname && category.name !== catname) {
                cleanupLocalFiles(req.files);
                return res.status(400).json({
                    message: "Category ID and Category Name do not match",
                    error: true,
                    success: false,
                });
            }
        }

        if (subcatid || subcat) {
            if (subcatid) {
                subCategory = await categoryModel.findById(subcatid);
                if (!subCategory) {
                    cleanupLocalFiles(req.files);
                    return res.status(400).json({
                        message: "Subcategory not found",
                        error: true,
                        success: false,
                    });
                }
                product.subcatId = subcatid;
            }

            if (subcat) {
                subCategory = await categoryModel.findOne({ name: subcat });
                if (!subCategory) {
                    cleanupLocalFiles(req.files);
                    return res.status(400).json({
                        message: "Subcategory not found",
                        error: true,
                        success: false,
                    });
                }
                product.subcat = subcat;
            }

            // Cross check if both provided
            if (subcatid && subcat && subCategory.name !== subcat) {
                cleanupLocalFiles(req.files);
                return res.status(400).json({
                    message: "Subcategory ID and Subcategory Name do not match",
                    error: true,
                    success: false,
                });
            }
        }

        // === Uniqueness check for product name in category/subcategory ===
        if (name && (catid || subcatid)) {
            const existingProduct = await productModel.findOne({
                name,
                catId: product.catId,
                subcatId: product.subcatId,
                _id: { $ne: product._id }, // exclude current product
            });

            if (existingProduct) {
                cleanupLocalFiles(req.files);
                return res.status(400).json({
                    message:
                        "Product with this name already exists in the same category / subcategory",
                    error: true,
                    success: false,
                });
            }
        }

        // === Handle Images ===
        if (req.files && req.files.length > 0) {
            await deleteImages(product.images); // delete old images

            const uploadedImages = [];
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };

            for (let f of req.files) {
                const result = await cloudinary.uploader.upload(f.path, options);
                uploadedImages.push(result.secure_url);
                fs.unlinkSync(f.path); // remove local file
            }
            product.images = uploadedImages;
        }

        await product.save();

        return res.status(200).json({
            message: "Product updated successfully",
            success: true,
            error: false,
            product,
        });
    } catch (error) {
        cleanupLocalFiles(req.files); // ensure cleanup on error
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

export async function getallproducts(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({}).populate("category").skip((page - 1) * perpage).limit(perpage).exec();

        if (!products) {
            return res.status(400).json({
                message: "Products not found",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            message: `${count} Products not found`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbycatid(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ catId: req.params.catid }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();

        const foundcount = await productModel.countDocuments({ catId: req.params.catid });

        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this category",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbycatname(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ catname: req.query.catname }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();

        const foundcount = await productModel.countDocuments({ catname: req.query.catname });

        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this category",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbysubcatid(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ subcatId: req.params.subcatid }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        const foundcount = await productModel.countDocuments({ subcatId: req.params.subcatid });


        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this subcategory",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbysubcatname(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ subcat: req.query.subcat }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        const foundcount = await productModel.countDocuments({ subcat: req.query.subcat });

        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this subcategory",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbythirdsubid(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ thirdsubcatId: req.params.thirdsubcatid }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        const foundcount = await productModel.countDocuments({ thirdsubcatId: req.params.thirdsubcatid });


        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this subcategory",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbythirdsubcat(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        const products = await productModel.find({ thirdsubcat: req.query.thirdsubcat }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        const foundcount = await productModel.countDocuments({ thirdsubcat: req.query.thirdsubcat });

        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this subcategory",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function filterbyprice(req, res) {

    try {

        let productlist = [];

        if (req.query.catid !== "" && req.query.catid !== undefined) {

            productlist = await productModel.find({ catId: req.query.catid }).populate("category");

        } else if (req.query.subcatid !== "" && req.query.subcatid !== undefined) {

            productlist = await find({ subcatId: req.query.subcatid }).populate("category");

        } else if (req.query.thirdsubcatid !== "" && req.query.thirdsubcatid !== undefined) {

            productlist = await find({ thirdsubcatId: req.query.thirdsubcatid }).populate("category");

        } else {
            return res.status(400).json({
                message: "No Category Id / SubCategory Id / ThirdSubCategory Id",
                error: true,
                success: false,
            });
        }

        const filteredproducts = productlist.filter((product) => {
            if (req.query.minprice && product.price < parseInt(+req.query.minprice)) {
                return false;
            }
            if (req.query.maxprice && product.price > parseInt(+req.query.maxprice)) {
                return false;
            }
            return true;
        })

        return res.status(200).json({
            message: "Products Found: ",
            products: filteredproducts,
            error: false,
            success: true,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductbyrating(req, res) {

    try {


        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;
        const count = await productModel.countDocuments({});
        const totalpages = Math.ceil(count / perpage)

        if (page > totalpages) {
            return res.status(404).json({
                message: "page not found",
                error: true,
                success: false,
            })
        }

        let products = []

        if (req.query.catid) {
            products = await productModel.find({
                rating: req.query.rating,
                catId: req.query.catid
            }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        }
        if (req.query.subcatid) {
            products = await productModel.find({
                rating: req.query.rating,
                subcatId: req.query.subcatid
            }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        }
        if (req.query.thirdsubcatid) {
            products = await productModel.find({
                rating: req.query.rating,
                thirdsubcatId: req.query.thirdsubcatid
            }).populate("category").skip((page - 1) * perpage).limit(perpage).exec();
        }

        const foundcount = await productModel.countDocuments({ rating: req.query.rating });

        if (products.length === 0) {
            return res.status(400).json({
                message: "No products found for this rating",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            total: `${count} Products found`,
            matched: `${foundcount} Products matched`,
            products: products,
            TotalPages: totalpages,
            page: page,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getproductcount(req, res) {

    try {

        const count = await productModel.countDocuments({});

        if (!count) {
            return res.status(400).json({
                message: "No Products to count",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: `${count} Products found`,
            error: false,
            success: true,

        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getallfeaturedproducts(req, res) {

    try {

        const products = await productModel.find({
            isfeatured: true
        }).populate("category");

        if (!products) {
            return res.status(400).json({
                message: "No featured Products",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: " Products found: ",
            products: products,
            error: false,
            success: true,

        });


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function deleteproduct(req, res) {

    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(400).json({
                message: "No products found check product id",
                error: true,
                success: false,
            });
        }

        const deletedproduct = await deleteProductRecursive(product);


        return res.status(200).json({
            message: "Product Deleted successfully",
            result: deletedproduct,
            error: false,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function getsingleproduct(req, res) {

    try {
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(400).json({
                message: "No products found check product id",
                error: true,
                success: false,
            });
        }

        return res.status(200).json({
            message: "Product found",
            product: product,
            error: false,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }

}

export async function deleteimagesfromcloud(req, res) {
    try {
        let urls = req.query.url;

        if (!urls) {
            return res.status(400).json({
                message: "No URL provided",
                error: true,
                success: false,
            });
        }

        // normalize: if it's a single string, wrap in array
        if (typeof urls === "string") {
            urls = [urls];
        }

        const deleted = await deleteImages(urls);

        return res.status(200).json({
            message: `Deleted ${deleted.length} images`,
            deleted,
            error: false,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}