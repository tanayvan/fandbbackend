const Branch = require("../models/branch");
const user = require("../models/user");

exports.getBranchById = (req, res, next, id) => {
  Branch.findById(id)
    .populate("city")
    .exec((err, branch) => {
      if (err) {
        return res.status(400).json({
          error: "Branch Not Found",
        });
      }
      req.branch = branch;

      next();
    });
};

exports.createBranch = (req, res) => {
  branchData = {
    ...req.body,
    user_id: req.profile._id,
  };
  const branch = new Branch(branchData);
  branch.save((err, branch) => {
    if (err) {
      return res.status(400).json({
        error: "Branch Not able to save",
      });
    }
    res.json({ branch });
  });
};

exports.getBranch = (req, res) => {
  console.log(req.branch);
  return res.json(req.branch);
};

exports.getAllBranch = (req, res) => {
  const query = req.query.user
    ? { city: req.params.cityId, user_id: req.query.user }
    : { city: req.params.cityId };

  console.log(query);
  Branch.find({ city: req.params.cityId })
    .populate("city")
    .exec((err, branch) => {
      if (err) {
        return res.status(400).json({
          error: "No Branch Found",
        });
      }
      res.json(branch);
    });
};

exports.updateBranchName = (req, res) => {
  const branch = req.branch;
  branch.name = req.body.name;

  branch.save((err, updatedBranch) => {
    if (err) {
      return res.status(400).json({
        error: "Error updating Branch ",
      });
    }
    res.json(updatedBranch);
  });
};
exports.updateBranchCity = (req, res) => {
  const branch = req.branch;
  branch.city = req.body.city;

  branch.save((err, updatedBranch) => {
    if (err) {
      return res.status(400).json({
        error: "Error updating Branch ",
      });
    }
    res.json(updatedBranch);
  });
};
exports.deleteBranch = (req, res) => {
  const branch = req.branch;
  if (branch.user_id != req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this branch ",
    });
  }
  branch.remove((err, branch) => {
    if (err) {
      return res.status(400).json({
        error: "Error deleting Branch ",
      });
    }
    res.json({
      message: "Successfully Deleted",
    });
  });
};

exports.reserveATable = (req, res) => {
  const branch = req.branch;
  if (branch.user_id != req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this branch ",
    });
  }
  branch.reserved_table.push(req.body.table_no);
  branch.save((err, updatedBranch) => {
    if (err) {
      return res.status(400).json({
        error: "Error updating Branch ",
      });
    }
    res.json(updatedBranch);
  });
};
exports.unReserveATable = (req, res) => {
  const branch = req.branch;
  if (branch.user_id !== req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this branch ",
    });
  }
  Branch.findByIdAndUpdate(branch._id, {
    $pull: { reserved_table: req.body.table_no },
  })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "Error updating tables ",
      });
    });
};

exports.insertOutOfStockProduct = (req, res) => {
  req.branch.out_of_stock_products.push(req.body.product);

  req.branch.save((err, updatedBranch) => {
    if (err) {
      return res.status(400).json({
        error: "Error inserting product",
      });
    }
    res.json(updatedBranch);
  });
};
exports.removeOutOfStockProduct = (req, res) => {
  req.branch.out_of_stock_products.pull(req.body.product);

  req.branch.save((err, updatedBranch) => {
    if (err) {
      return res.status(400).json({
        error: "Error deleting product",
      });
    }
    res.json(updatedBranch);
  });
};
