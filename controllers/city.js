const branch = require("../models/branch");
const City = require("../models/city");

exports.getCityById = (req, res, next, id) => {
  City.findById(id).exec((err, city) => {
    if (err) {
      return res.status(400).json({
        error: "City Not Found",
      });
    }
    req.city = city;

    next();
  });
};

exports.createCity = (req, res) => {
  cityData = {
    ...req.body,
    user_id: req.profile._id,
  };
  const city = new City(cityData);
  city.save((err, city) => {
    if (err) {
      return res.status(400).json({
        error: "City Not able to save",
      });
    }
    res.json({ city });
  });
};

exports.getCity = (req, res) => {
  console.log(req.city);
  return res.json(req.city);
};

exports.getAllCity = (req, res) => {
  const query = req.query.user ? { user_id: req.query.user } : {};
  City.find(query).exec((err, city) => {
    if (err) {
      return res.status(400).json({
        error: "No City Found",
      });
    }
    res.json(city);
  });
};

exports.updateCity = (req, res) => {
  const city = req.city;
  city.name = req.body.name;

  city.save((err, updatedCity) => {
    if (err) {
      return res.status(400).json({
        error: "Error updating City ",
      });
    }
    res.json(updatedCity);
  });
};
exports.deleteCity = (req, res) => {
  const city = req.city;
  console.log(city.user_id, req.profile._id);
  if (city.user_id != req.profile._id) {
    return res.status(401).json({
      error: "You are not Authorized to make Changes in this city ",
    });
  }
  city.remove((err, city) => {
    if (err) {
      return res.status(400).json({
        error: "Error deleting City ",
      });
    }
    branch.deleteMany({ city: city._id }, (err) => {
      if (err) {
        return res.status(400).json({
          error:
            "Error deleting deleting braches related to the deleted cities  ",
        });
      }
      res.json({
        message: "Successfully Deleted",
      });
    });
  });
};
