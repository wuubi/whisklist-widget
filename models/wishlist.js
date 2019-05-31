const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const wishlistSchema = new Schema({
  id: ObjectId,
  data: {
    id: Number,
    customer_id: Number,
    name: String,
    is_public: Boolean,
    items: {
      id: Number,
      product_id: Number,
      variant_id: Number
  }
}
});

module.exports = mongoose.model('Wishlist', wishlistSchema);