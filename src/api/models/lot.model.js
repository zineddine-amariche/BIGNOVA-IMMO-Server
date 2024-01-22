const mongoose = require("mongoose");

const lot = mongoose.Schema(
  {
    numerodelot: {
      type: String,
      required: true,
    },
    surfacetotal: {
      type: Number,
      required: true,
    },
    surfacesansbalcon: {
      type: Number,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    bloc: {
      type: String,
      required: true,
      // minlength: 5,
      // maxlength: 255,
    },
    etage: {
      type: Number,
      required: true,
      // minlength: 5,
      // maxlength: 255,
    },

    dateCreation: Date, //  ca ce fais automatiquement

    typelot: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "typelot",
      },
    ],
    projet: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projet",
      },
    ],
    createdBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    updatedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Lot = mongoose.model("lot", lot);

module.exports = Lot;
