require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cityRoutes = require("./routes/city");
const branchRoutes = require("./routes/branch");

//DB CONNECTION
mongoose
  .connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB Connected !");
  })
  .catch((err) => {
    console.log(`DB Connection Fail ! + ${err}`);
  });

//MiddleWares
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", cityRoutes);
app.use("/api", branchRoutes);

//Port
const port = process.env.PORT || 4000;
//Server Listening
app.listen(port, () => {
  console.log(`App Has Started on ${port}`);
});
