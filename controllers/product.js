const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

//Cloudinary Connection
var cloudinary = require("cloudinary").v2;
const category = require("../models/category");
cloudinary.config({
  cloud_name: "dbpwonhqd",
  api_key: "335547494643579",
  api_secret: "wF2-SCqJDAj1IYgD2tsaE7i6voA",
});

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product Not Found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createPhotoUrl = async (req, res, next) => {
  console.log(req.file, "Line 29");
  cloudinary.uploader.upload(req.file.path, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send("upload image error");
    }

    req.body.photo = data.secure_url;
    next();
  });
};
exports.createProduct = (req, res) => {
  console.log(req.body.photo);
  productData = {
    ...req.body,
    user_id: req.profile._id,
  };
  let product = new Product(productData);

  product.save((err, product) => {
    if (err) {
      return res.status(400).json({
        error: "Error Creating Product",
      });
    }
    category.findById(product.category._id).then((category) => {
      product.category = category;
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  return res.json(req.product);
};
//middlewares
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File Size Too Big",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //save to DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "updating tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  if (product.user_id != req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this product ",
    });
  }
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete a product",
      });
    }
    res.json({
      message: "Successfully deleted",
    });
  });
};

exports.getAllProducts = (req, res) => {
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  const query = req.query.user ? { user_id: req.query.user } : {};
  Product.find(query)
    .populate("category")
    .sort([[sortBy, "asc"]])
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Product Found",
        });
      }
      res.json(products);
    });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operation Failed",
      });
    }
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Category Found",
      });
    }
    res.json(category);
  });
};
