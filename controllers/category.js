const Category = require("../models/category");
const Product = require("../models/product");

exports.getCategoryId = (req, res, next, id) => {
  Category.findById(id).exec((err, cat) => {
    if (err) {
      return res.status(400).json({
        error: "Category Not Found",
      });
    }
    req.category = cat;

    next();
  });
};

exports.createCategory = (req, res) => {
  categoryData = {
    ...req.body,
    user_id: req.profile._id,
  };
  const category = new Category(categoryData);
  category.save((err, category) => {
    if (err) {
      console.log("====================================");
      console.log(err);
      console.log("====================================");
      return res.status(400).json({
        error: "Category Not able to save",
      });
    }
    res.json({ category });
  });
};

exports.getCategory = (req, res) => {
  console.log(req.category);
  return res.json(req.category);
};

exports.getAllCategory = (req, res) => {
  const query = req.query.user ? { user_id: req.query.user } : {};
  Category.find(query).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Category Found",
      });
    }
    res.json(category);
  });
};

exports.updateCategory = (req, res) => {
  const category = req.category;
  category.name = req.body.name;

  category.save((err, updatedCategory) => {
    if (err) {
      return res.status(400).json({
        error: "Error updating Category ",
      });
    }
    res.json(updatedCategory);
  });
};
exports.deleteCategory = (req, res) => {
  const category = req.category;
  if (category.user_id != req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this category ",
    });
  }
  Product.find({ category: req.category._id }).exec((err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Error deleting Products ",
      });
    }
    products.length > 0 &&
      products.map((product) => {
        Product.findByIdAndDelete(product._id).exec((err) => {
          if (err) {
            return res.status(400).json({
              error: "Error deleting Products ",
            });
          }
        });
      });
    category.remove((err, category) => {
      if (err) {
        return res.status(400).json({
          error: "Error deleting Category ",
        });
      }
      res.json({
        message: "Successfully Deleted",
      });
    });
  });
};
