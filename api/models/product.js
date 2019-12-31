const mongoos = require("mongoose");

const productSchema = {
  _id: mongoos.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  productImage: { type: String, required: true }
};

module.exports = mongoos.model("Product", productSchema);
