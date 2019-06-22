const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist.js');

router.get('/wishlists', (req, res) => {
  Wishlist.find({}, (err, allWishlists) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('index', {
        title: 'Welcome to Whisklist | View Wishlists',
        wishlists: allWishlists
      });
    }
  });
});
router.post('/wishlists/add', (req, res) => {
  let message = '';
  let id = req.body.id;
  let customer_id = req.body.customer_id;
  let name = req.body.name;
  let is_public = req.body.is_public;
  let items = req.body.items;

  let newWishlist = {
    id: id,
    customer_id: customer_id,
    name: name,
    is_public: is_public,
    items: items
  };
  Wishlist.create(newWishlist, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      res.redirect('/');
    }
  });
});
router.get('/wishlists/:id', (req, res) => {
  let wishlistId = req.params.id;

  Wishlist.findById(wishlistId).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render('index', {
      title: 'Edit Wishlist',
      wishlist: ret,
      message: ''
    });
  });
});
router.post('/wishlists/edit/:id', (req, res) => {
  let wishlistId = req.params.id;

  Wishlist.findByIdAndUpdate(wishlistId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
router.get('/wishlists/delete/:id', (req, res) => {
  let wishlistId = req.params.wishlist_id;

  Wishlist.findByIdAndRemove(wishlistId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
module.exports = router;
