const express = require("express");
const app = express();

const morgan = require("morgan");
const mongoos = require("mongoose");

const bodyParser = require("body-parser");
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const productRoutes = require("./api/Routes/product");
const orderRoutes = require("./api/Routes/order");
const userRoutes = require("./api/Routes/user");
// const userNotes = require("./api/Routes/note")
//!important   to connect mongoAtlas
mongoos.connect(
  "mongodb+srv://nabeel:" +
    process.env.MONGO_ATLAS_PW +
    "@cluster0-s8ndk.mongodb.net/test?retryWrites=true&w=majority",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true
  }
);
mongoos.Promise = global.Promise;

app.use("/product", productRoutes);
app.use("/order", orderRoutes);
app.use("/user/", userRoutes);
// app.use("/note", userNotes)

app.use((req, res, next) => {
  const error = new Error("not found");
  error.status = 404;
  next(error);
});

app.use((req, res, next) => {
  //to handle CROS origin error
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  //to check configuration if the configuration will be ok
  if (req.method === "OPTION") {
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, PATCH, DELETE, GET "
    );
    return res.status(200).json({});
  }
  next();
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
  next();
});

app.use("/product", productRoutes);
app.use("/order", orderRoutes);

module.exports = app;
