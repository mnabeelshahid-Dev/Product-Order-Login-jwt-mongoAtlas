const express = require("express");
const router = express.Router();
const mongoos = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(404).json({
          message: "mail exist"
        });FFff
      } else {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
          if (err) {
            res.status(500).json({
              message: "there was some error",
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoos.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log("result is", result);
                res.status(200).json({
                  message: "User successfully created"
                });
              })
              .catch(err => {
                console.log("error is", err);
                res.status(404).json({
                  message: "user not created",
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(404).json({
          message: "Auth not found"
        });
      } else {
        bcrypt.compare(req.body.password, user[0].password, function(
          err,
          result
        ) {
          if (err || !result) {
            return res.status(404).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              { email: user[0].email, id: user[0]._id },
              process.env.JWT_KEY,
              { expiresIn: "1h" }
            );
            return res.status(200).json({
              message: "Auth created",
              token: token
            });
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "there was some error",
        error: err
      });
    });
});
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  User.findById(id)
    .remove({ _id: id })
    .exec()
    .then(user => {
      console.log(user);
      res.status(200).json({
        message: "user deleted"
      });
    })
    .catch(err => {
      console.log("user is", err);
      res.status(500).json({
        message: "there was some error"
      });
    });
});

module.exports = router;
