import categoryModel from '../models/catagory.model.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


async function deleteImages(images) {
  if (!images || images.length === 0) return;

  for (let img of images) {
    const URLarray = img.split("/");
    const image = URLarray[URLarray.length - 1];
    const imagename = image.split(".")[0];

    const deletedimage = await cloudinary.uploader.destroy(imagename);

    if (!deletedimage || deletedimage.result !== "ok") {
      throw new Error(`Failed to delete image: ${imagename}`);
    }
  }
}


async function deleteCategoryRecursive(category) {
  // Find subcategories of this category
  const subcategories = await categoryModel.find({ parentId: category._id });

  // Recursively delete all subcategories
  for (let subcat of subcategories) {
    await deleteCategoryRecursive(subcat); // passing full subcat object
  }

  // Delete this category's images
  await deleteImages(category.images);

  // Delete this category itself
  await categoryModel.findByIdAndDelete(category._id);

  return true;
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

export async function createCategory(req, res) {
  try {

    if (req.body.parentId || req.body.parentCatName) {

      if (req.body.parentCatName && req.body.parentId) {

        const categories = await categoryModel.findById(req.body.parentId)

        if (categories && categories.name === req.body.parentCatName) {

          const uploadedImages = [];


          if (req.files && req.files.length > 0) {
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
          }


          const category = new categoryModel({
            name: req.body.name,
            images: uploadedImages,
            parentId: req.body.parentId,
            parentCatName: req.body.parentCatName
          });

          await category.save();

          return res.status(201).json({
            message: "Category Created",
            success: true,
            error: false,
            category
          });
        };
        
         cleanupLocalFiles(req.files);
        return res.status(400).json({
          message: "No Category with this Id or Name",
          success: false,
          error: true,
        });

      }

       cleanupLocalFiles(req.files);
      return res.status(400).json({
        message: !req.body.parentId ? "Provide Parent Category Id" : "Provide Parent Category Name",
        success: false,
        error: true,
      });
    }

    const uploadedImages = [];

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    if (req.files && req.files.length > 0) {
      for (let f of req.files) {
        const result = await cloudinary.uploader.upload(f.path, options);
        uploadedImages.push(result.secure_url);

        // remove local file
        fs.unlinkSync(f.path);
      }
    }

    const category = new categoryModel({
      name: req.body.name,
      images: uploadedImages,
    });

    await category.save();

    return res.status(201).json({
      message: "Category Created",
      success: true,
      error: false,
      category
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getallcategories(req, res) {
  try {
    const categories = await categoryModel.find({});

    const categoryMap = {};

    // Build a map of all categories
    categories.forEach(cat => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootcategories = [];

    categories.forEach(cat => {
      if (cat.parentId) {
        // push into parent's children
        categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
      } else {
        // root category
        rootcategories.push(categoryMap[cat._id]);
      }
    });

    return res.status(200).json({
      message: "Categories fetched successfully",
      success: true,
      error: false,
      categories: rootcategories
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function countCategories(req, res) {

  try {

    const categories = await categoryModel.countDocuments({ parentId: undefined })

    if (categories) {
      return res.status(200).json({
        message: "Total Categories are:",
        categories: categories,
        error: true,
        success: false,
      });
    }

    return res.status(400).json({
      message: "Result not found",
      error: true,
      success: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }

}

export async function countSubCategories(req, res) {

  try {

    const categories = await categoryModel.find({})

    if (categories) {
      const SubCategories = [];
      for (let cat of categories) {
        if (cat.parentId !== null) {
          SubCategories.push(cat)
        }
      }

      return res.status(200).json({
        message: "Total Categories are:",
        categories: SubCategories.length,
        error: true,
        success: false,
      });
    }

    return res.status(400).json({
      message: "Result not found",
      error: true,
      success: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }

}

export async function getcategorybyid(req, res) {

  try {

    const category = await categoryModel.findById(req.params.catid)

    if (category) {

      return res.status(200).json({
        message: "Result found",
        category: category,
        error: true,
        success: false,
      });
    }

    return res.status(400).json({
      message: "Result not found",
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


export async function deletefromcloud(req, res) {
  try {
    const categoryimage = req.query.image;

    if (!categoryimage) {
      return res.status(400).json({
        message: "Image URL is required",
        error: true,
        success: false,
      });
    }

    // Extract public_id from URL
    const URLarray = categoryimage.split("/");
    const image = URLarray[URLarray.length - 1];
    const imagename = image.split(".")[0]; // <-- public_id

    // Step 1: Check if image exists
    let resource;
    try {
      resource = await cloudinary.api.resource(imagename);
    } catch (err) {
      if (err.http_code === 404) {
        return res.status(404).json({
          message: "Image not found on Cloudinary",
          error: true,
          success: false,
        });
      }
      throw err; // other errors bubble up
    }

    // Step 2: Delete if found
    const deletedimage = await cloudinary.uploader.destroy(imagename);

    if (deletedimage.result === "ok") {
      return res.status(200).json({
        message: "Image deleted successfully",
        error: false,
        success: true,
      });
    }

    return res.status(400).json({
      message: "Failed to delete image",
      error: true,
      success: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


export async function deletecategory(req, res) {
  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not Found",
        error: true,
        success: false,
      });
    }

    await deleteCategoryRecursive(category);

    return res.status(200).json({
      message: "Category and all Subcategories deleted successfully",
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


export async function updatecategory(req, res) {

  try {
    const category = await categoryModel.findById(req.params.id);
    const { name, parentId, parentCatName } = req.body;
    if (!category) {
      return res.status(400).json({
        message: "Category Not found",
        error: true,
        success: false,
      })
    }

    if (name) {
      if (name === category.name) {
        return res.status(400).json({
          message: "Category Name already in use",
          error: true,
          success: false,
        })
      }
      category.name = name;

    }



    if (parentCatName || parentId) {
      if (parentId && (category.parentCatName || parentCatName)) {
        if (parentId === category.parentId) {
          return res.status(400).json({
            message: "Parent Category Id already in use",
            error: true,
            success: false,
          })
        }
        category.parentId = parentId;
      }

      if (parentCatName && (category.parentId || parentId)) {
        if (parentCatName === category.parentCatName) {
          return res.status(400).json({
            message: "Parent Category Name already in use",
            error: true,
            success: false,
          })
        }
        category.parentCatName = parentCatName;
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = [];

      await deleteImages(category.images);

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
      category.images = uploadedImages;
    }
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully",
      success: true,
      error: false,
      category,
    });

  }
  catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }

}