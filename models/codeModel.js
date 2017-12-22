let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CodeSchema = new Schema({
  slug: {
    type: String,
    lowercase: true,
    index: true
  },
  title: String,
  code: {
    type: Number,
    index: true
  },
  contact: {
    type: Number
  },
  createdByName: String,
  is_stolen: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  createdById: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdBy: {
    type: String
  },
  
  // image: String,
});

module.exports = mongoose.model('Code', CodeSchema);