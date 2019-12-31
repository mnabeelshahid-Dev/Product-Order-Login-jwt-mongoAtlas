const express = require("express");
const router = express.Router();
const mongoos = require("mongoose");
const checkAuth = require("../middleware/check-Auth");
// upload file  parser
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, process.cwd() + "/uploads");
  },
  // to set file directory
  filename: function(req, file, cb) {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, "-")}${file.originalname
        .split(" ")
        .join("_")}`
    );
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const Product = require("../models/product");

router.get("/", (req, res, next) => {
  console.log(process.cwd());

  Product.find()
    .select("name price _id productImage")
    .exec()
    .then(result => {
      const response = {
        count: result.length,
        product: result.map(resl => {
          return {
            name: resl.name,
            price: resl.price,
            productId: resl.id,
            productImage: resl.productImage,
            request: {
              type: "GET",
              url: "http://localhost:3000/product/" + resl._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", checkAuth, upload.single("productImage"), (req, res) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoos.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  console.log("post product", product);
  product
    .save()
    .then(result => {
      res.status(200).json({
        message: "Created Product Successfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          productImage: result.productImage,
          request: {
            type: "POST",
            url: "http://localhost:3000/product/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .select("name price _id prductImage")
    .exec()
    .then(doc => {
      console.log("doc is", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          message: "get product successfully",
          request: {
            type: "GET",
            url: "http://localhost:3000/product/" + id
          }
        });
      } else {
        res.status(404).json({
          message: "the given of this product was not define "
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
// !important  please check it out
router.patch("/:id", checkAuth, (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps["name"] = ops.name;
    updateOps["price"] = ops.price;
  }
  console.log("update", updateOps);
  Product.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "product successfully updated",
        request: {
          type: "PATCH",
          url: "http://localhost:3000/product/" + id
        }
      });
    })
    .catch(err => {
      console.log("error is ", err);
      res.status(500).json(err);
    });
});
router.delete("/:id", checkAuth, (req, res, next) => {
  const id = req.params.id;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "The product will be successfully deleted",
        request: {
          type: "DELETE",
          url: "http://localhost:3000/product/" + id
        },
        body: {
          name: "String",
          price: "Number"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
