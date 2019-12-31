const express = require("express");
const router = express.Router();
const mongoos = require("mongoose");
const checkAuth = require("../middleware/check-Auth");
const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", checkAuth, (req, res, next) => {
  Order.find()
    .select("_id product quantity")
    .populate("product", "name price ")
    .exec()
    .then(result => {
      console.log("result order", result);
      res.status(200).json({
        count: result.length,
        order: result.map(resl => {
          console.log("product is", resl);
          return {
            id: resl._id,
            product: resl.product,
            quantity: resl.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/order/" + resl._id
            }
          };
        })
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/", checkAuth, (req, res, next) => {
  // find product id to order will be created
  Product.findById(req.body.id)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "product not found"
        });
      }
      const order = new Order({
        _id: mongoos.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.id
      });
      return order.save().then(data => {
        console.log("res is", data);
        res.status(200).json({
          message: "Order Created",
          createOrder: {
            id: data.id,
            quantity: data.quantity,
            product: data.product
          },
          request: {
            type: "POST",
            url: "http://localhost:3000/order/" + data._id
          }
        });
      });
    })
    .catch(err => {
      res.status(400).json({
        message: "Product not found",
        error: err
      });
    });
});

router.get("/:id", checkAuth, (req, res, next) => {
  Order.findById(req.params.id)
    .select("quantity _id product")
    .populate("product", "name")
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.status(200).json({
        message: "User order",
        order: {
          id: order.id,
          quantity: order.quantity,
          productId: order.product
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/order/" + order._id
        }
      });
    })
    .catch(err => {
      res.status(502).json({
        error: err
      });
    });
});
router.patch("/:id", checkAuth, (req, res, next) => {
  const id = req.params.id;
  console.log("id is", id);
  if (!id) {
    return res.status(404).json({
      message: "id not found"
    });
  }
  const updateObj = {};
  for (let obj of req.body) {
    updateObj["quantity"] = obj.quantity;
  }
  Order.updateOne({ _id: id }, { $set: updateObj })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "order successfully updated",
        request: {
          type: "PATCH",
          url: "http://localhost:3000/order/" + id
        }
      });
    })
    .catch(err => {
      console.log("error is", err);
      res.status(500).json({
        message: "there was some error",
        error: err
      });
    });
});

router.delete("/:id", checkAuth, (req, res, next) => {
  console.log(req.params.id);
  Order.remove({ _id: req.params.id })
    .exec()
    .then(result => {
      console.log("result is", result);
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "DELETED",
          url: "http://localhost:3000/order/"
        },
        body: {
          productId: "ID",
          quantity: "Number"
        }
      });
    })
    .catch(err => {
      console.log("error is", err);
      res.status(500).json({
        message: "request failed",
        error: err
      });
    });
});

module.exports = router;
