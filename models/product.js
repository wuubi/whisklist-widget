const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const idSchema = new Schema({id:Number});

const productSchema = new Schema({
  id: ObjectId,
  wishlists: [idSchema],
  data: {
    id: Number,
    name: String,
    sku: String
  }
});

module.exports = mongoose.model('Product', productSchema);