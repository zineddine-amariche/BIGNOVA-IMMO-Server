const mongoose = require("mongoose");

const typelot = mongoose.Schema(
  {
    typeName: {
      type: String,
      required: true,
    },

    dateCreation: Date, //  ca ce fais automatiquement
  },
  {
    timestamps: true,
  }
);

const TypeLot = mongoose.model("typelot", typelot);

module.exports = TypeLot;
