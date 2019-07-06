require('dotenv').config();

const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
BigCommerce = require('node-bigcommerce');
const Wishlist = require('../models/Wishlist.js');

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});
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
router.get('/products/update', (req, res) => {
  res.render('index', { message: 'Updating' });
  const getProducts = new Promise(async function(resolve, reject) {
    bigCommerce.get('/catalog/products').then(data => {
      Arr = data.data;
      let pArr = [];
      for ([key, value] of Object.entries(Arr)) {
        if (value.id) {
          pArr.push(value.id);
        }
      }
      console.log(pArr);
      e();
      async function e() {
        for (i = 0; i < pArr.length; i++) {
          await bigCommerce.get('/catalog/products/' + pArr[i]).then(data => {
            prodArr = [];
            prodArr = data.data;
            pId = prodArr.id;
            console.log(pId);
            Wishlist.collection.find(
              { 'items.product_id': pId },
              null,
              function(err, docs) {
                if (docs) {
                  wIdArr = [];
                  docs.forEach(element => {
                    for ([key, value] of Object.entries(element)) {
                      if (key === 'id' && wIdArr.includes(value) != true) {
                        wIdArr.push(value);
                      }
                    }
                    Product.collection.findOne({ id: pId }, null, function(
                      err,
                      docs
                    ) {
                      if (err) throw err;
                      if (docs != null) {
                        console.log(pId + 'LINE 169');
                        console.log(wIdArr + 'LINE 170');
                        wIdArr.forEach(element => {
                          console.log(element);
                          Product.collection.findOne(
                            { id: pId, 'wishlists.id': element },
                            null,
                            function(err, docs) {
                              if (err) throw err;
                              if (docs == null) {
                                Product.collection.findOneAndUpdate(
                                  { id: pId },
                                  { $push: { wishlists: { id: element } } },
                                  function(err, docs) {
                                    if (err) throw err;
                                    else {
                                      console.log(
                                        'Number of inserted Products: ' +
                                          docs.insertedCount
                                      );
                                    }
                                  }
                                );
                              }
                              if (docs != null) {
                                console.log(
                                  element + ' wishlist already saved to product'
                                );
                              }
                            }
                          );
                        });
                      }
                      if (docs == null) {
                        Product.collection.insertOne(prodArr, null, function(
                          err,
                          docs
                        ) {
                          if (err) throw err;
                          if (docs) {
                            console.log(
                              'Number of inserted Products: ' +
                                docs.insertedCount
                            );
                          }
                        });
                      }
                    });
                  });
                  console.log(wIdArr);
                } else {
                  return reject(err);
                }
              }
            );
          });
        }
      }
    });
    return resolve();
  }).catch(err => {
    console.log('getProducts rejected' + err);
  });
  getProducts;
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
