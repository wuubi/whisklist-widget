const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');

router.get('/products', (req, res) => {
  Product.find({}, (err, allProducts) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('index', {
        title: 'Welcome to Whisklist | View Products',
        products: allProducts
      });
    }
  });
});
router.post('/products/add', (req, res) => {
  let message = '';
  let id = req.body.id;
  let name = req.body.name;
  let sku = req.body.sku;

  let newProduct = { id: id, name: name, sku: sku };
  Product.create(newProduct, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyCreated);
      res.redirect('/');
    }
  });
});
router.get('/products/:id', (req, res) => {
  let productId = req.params.id;

  Product.findById(productId).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.render('index', {
      title: 'Edit Product',
      product: ret,
      message: ''
    });
  });
});
router.post('/products/edit/:id', (req, res) => {
  let productId = req.params.id;

  Product.findByIdAndUpdate(productId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
router.get('/products/delete/:id', (req, res) => {
  let productId = req.params.product_id;

  Product.findByIdAndRemove(productId, req.body).exec((err, ret) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});
module.exports = router;
