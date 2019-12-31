const mongoos = require("mongoose");

const userSchema = {
  _id: mongoos.Schema.Types.ObjectId,
  email: { type: String, required: true },
  //email regex search
  password: {
    type: String,
    required: true,
    unique: true,
    match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
  }
};
module.exports = mongoos.model("User", userSchema);
