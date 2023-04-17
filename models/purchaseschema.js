const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    products: Array,
    totalPrice: String,
    totalItem: String,
    bankCardDetails: Object,
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", historySchema);

module.exports = {
  Purchase,
  historySchema,
};
