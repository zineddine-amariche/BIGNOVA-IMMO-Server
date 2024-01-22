const { default: mongoose } = require("mongoose");

const projet = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  adresse: {
    type: String,
    required: true,
  },
  etat: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
    required: true,
  },
  dateCreation: Date,
  datefin: {
    type: String,
  },
  datestart: {
    type: String,
  },
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "lot",
  },
  description: {
    type: String,
    required: true,
  },
  statusName: {
    type: String,
  },
  createdBy: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  
  updatedBy: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  
});

projet.pre("save", function (next) {
  switch (this.etat) {
    case 1:
      this.statusName = "En cours";
      break;
    case 2:
      this.statusName = "terminés";
      break;
    case 3:
      this.statusName = "Futurs projets";
      break;
    default:
      this.statusName = "Unknown Status";
      break;
  }
  next();
});

const ProjetModel = mongoose.model("projet", projet);

module.exports = ProjetModel;


 
