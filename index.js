require('dotenv').config();

const express = require('express'),
  router = express.Router(),
  BigCommerce = require('node-bigcommerce');
bodyParser = require('body-parser');
exphbs = require('express-handlebars');
mongoose = require('mongoose');
(app = express()),
  (hbs = exphbs.create({
    /* config */
  }));
fs = require('fs');

const wishlistRoute = require('./routes/wishlist');
const productRoute = require('./routes/product');
const Wishlist = require('./models/Wishlist.js');
const Product = require('./models/Product.js');

const server = app.listen(process.env.PORT, () => {
  console.log('Express listening at ', server.address().port);
});

// MongoDB setup
mongoose.connect(process.env.MONGO, { useNewUrlParser: true });

const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});

// View Setup
app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    helpers: {
      toJSON: function(object) {
        return JSON.stringify(object);
      }
    }
  })
);
mongoose.set('debug', true);
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(wishlistRoute);
app.use(productRoute);

// ROUTES
app.get('/', function(req, res) {
  try {
    console.log(req + 'requestVal');
    Wishlist.find({}, (err, allWishlists) => {
      if (err) {
        console.log(err);
      } else {
        Product.find({}, (err, allProducts) => {
          if (err) {
            console.log(err);
          } else {
            res.render('index', {
              title: 'Wishlists',
              wishlists: allWishlists,
              products: allProducts
            });
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/auth', (req, res, next) => {
  bigCommerce
    .authorize(req.query)
    .then(data =>
      res
        .render('integrations/auth', { title: 'Authorized!', data: data })
        .catch(next)
    );
});

router.get('/load', (req, res, next) => {
  try {
    const data = bigCommerce.verify(req.query['signed_payload']);
    res.render('integrations/welcome', { title: 'Welcome!', data: data });
  } catch (err) {
    next(err);
  }
});

const getWishlists = new Promise(async function(resolve, reject) {
  await bigCommerce.get('/wishlists').then(data => {
    Arr = data.data;
    let wArr = [];
    for (let [key, value] of Object.entries(Arr)) {
      if (value.items.length > 0) {
        wArr.push(value.id);
      }
    }

    console.log(wArr + ' wArr ');
    e();
    async function e(resolve) {
      for (i = 0; i < wArr.length; i++) {
        await bigCommerce.get('/wishlists/' + wArr[i]).then(data => {
          wishlistsArr = [];
          wishlistsArr = data.data;
          console.log(wishlistsArr.id + 'LINE 148');

          Wishlist.collection.findOne({ id: wishlistsArr.id }, null, function(
            err,
            docs
          ) {
            if (docs === null) {
              Wishlist.collection.insertOne(data.data, function(err, res) {
                if (err) throw err;
                console.log(
                  'Number of documents inserted: ' + res.insertedCount
                );
              });
              if (err) throw err;
            } else {
              reject(err);
            }
          });
        });
      }
    }
    return resolve();
  });
}).catch(err => {
  console.log('getWishlists rejected' + err);
});

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
          Wishlist.collection.find({ 'items.product_id': pId }, null, function(
            err,
            docs
          ) {
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
                          'Number of inserted Products: ' + docs.insertedCount
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
          });
        });
      }
    }
  });
  return resolve();
}).catch(err => {
  console.log('getProducts rejected' + err);
});

kickOff().catch();
async function kickOff() {
  await getWishlists.then(getProducts);
}
