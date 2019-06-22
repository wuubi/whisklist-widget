const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
  _id: ObjectId,
  wishlists: [
    {
      wishlist: {
        type: Schema.Types.ObjectId,
        ref: 'wishlists'
      }
    }
  ],
  id: Number,
  name: String,
  sku: String
});

module.exports = mongoose.model('Product', productSchema);
