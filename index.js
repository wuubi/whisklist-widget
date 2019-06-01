require('dotenv').config();

const express = require('express'),
      router = express.Router(),
      BigCommerce = require('node-bigcommerce');
      bodyParser = require('body-parser');
      exphbs = require('express-handlebars');
      mongoose = require('mongoose');
      app = express(),
      hbs = exphbs.create({ /* config */ });
      fs = require('fs');

const wishlistRoute = require('./routes/wishlist');
const productRoute = require('./routes/product');
const Wishlist = require('./models/wishlist.js');
const Product = require('./models/product.js');

const server = app.listen(process.env.PORT, () => {
        console.log('Express listening at ', server.address().port);
    })

 // MongoDB setup
mongoose.connect(process.env.MONGO, { useNewUrlParser: true }); // Your mongodb:// URI/database



const bigCommerce = new BigCommerce({
  logLevel: 'info',
  clientId: process.env.CLIENT,
  accessToken: process.env.TOKEN,
  secret: process.env.SECRET,
  storeHash: process.env.HASH,
  callback: 'https://f26dcbab.ngrok.io/auth', // this does nothing right now
  responseType: 'json',
  apiVersion: 'v3' // Default is v2
});

// View Setup
app.engine('.hbs', exphbs({
  extname: '.hbs',
  helpers: {
    toJSON : function(object) {
      return JSON.stringify(object);
    }
  }
}));
mongoose.set('debug', true)
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(wishlistRoute);
app.use(productRoute);

prodArr = [];
prodArr = getWishlists();
console.log(prodArr + "LINE 56");
// ROUTES
app.get('/', function (req, res) {
  try {
    console.log(req + "requestVal");
        Wishlist.find({}, (err, allWishlists) => {
          if(err){
            console.log(err);
          } else{
            Product.find({}, (err, allProducts) => {
              if(err){
                console.log(err);
              } else{
              res.render('index', {title: 'Wishlists', wishlists: allWishlists, products:allProducts})
              }
            });
          }
        });
        
     } catch (err){
    console.log(err);
  }
})

router.get('/auth', (req, res, next) => {
    bigCommerce.authorize(req.query)
      .then(data => res.render('integrations/auth', { title: 'Authorized!', data: data })
      .catch(next));
});

router.get('/load', (req, res, next) => {
    try {
      const data = bigCommerce.verify(req.query['signed_payload']);
      res.render('integrations/welcome', { title: 'Welcome!', data: data })
    } catch (err) {
      next(err);
    }
  });

function getWishlists(){
  bigCommerce.get('/wishlists')
  .then(data => {
    Arr = data.data;
    for(customer_id in Arr){
      if (Arr.hasOwnProperty(customer_id)){
        customers = [];
        customers.push("customer_id: " + Arr[customer_id].customer_id);
        console.log(customers + "LINE 105");
      }
    }
    for(id in Arr){
      if (Arr.hasOwnProperty(id)){
          bigCommerce.get('/wishlists/'+ Arr[id].id).then(data => {
          itemsArr = data.data;
          console.log(itemsArr.id + "LINE 148");
          Wishlist.collection.findOne({"id":itemsArr.id}, null, function(err, docs){
            if (docs === null){
              
            Wishlist.collection.insertOne(data.data, function(err, res) {
              if (err) throw err;
              console.log('Number of documents inserted: ' + res.insertedCount);
              
            });
          }
        }); // LINE 151 WISHLIST FIND
          for(product_id in itemsArr.items){
              if(itemsArr.items.hasOwnProperty(product_id)){
                wishlistId = itemsArr.id;
                console.log(wishlistId + "WISHLIST ID LINE 165")
                productId = itemsArr.items[product_id].product_id;
                bigCommerce.get('/catalog/products/' + itemsArr.items[product_id].product_id)
                .then(data => {
                  data = data.data;
                  prodArr = new Object();
                  prodArr = JSON.stringify(data);
                  console.log(JSON.stringify(data.id) + "LINE 180");
                  console.log(prodArr + "LINE 181");
                  Product.collection.findOne({"id":data.id}, null, function(err, docs){
                    if (docs === null){
                    Product.collection.insertOne(data, function(err, res) {
                      Product.collection.findOne({'id': productId, 'wishlists': {'id':wishlistId}}, function(err, docs){
                            if (docs) {
                              console.log(JSON.stringify(docs) + "LINE 125");
                            }
                            else{
                              Wishlist.collection.findOne({'id': wishlistId, 'items.product_id': productId}, function(err, res){
                                if(err) throw err;
                                else{
                                Product.collection.findOneAndUpdate({'id': productId}, {$push: {'wishlists': {'id':wishlistId}}}, function(err,docs){
                                  if (err) throw err;
                                  else console.log(docs);
                                });
                                console.log(res);
                              }
                              });
                            }
                          });
                      if (err) throw err;
                      console.log('Number of documents inserted: ' + res.insertedCount);
                    });
                    
                  }
                    else {
                            Product.collection.findOne({'id': productId, 'wishlists': {'id':wishlistId}}, function(err, docs){
                              if (docs) {
                                console.log(JSON.stringify(docs) + "LINE 125");
                              }
                              else{
                                Wishlist.collection.findOne({'id': wishlistId, 'items.product_id': productId}, function(err, res){
                                  if(err) throw err;
                                  else{
                                  Product.collection.findOneAndUpdate({'id': productId}, {$push: {'wishlists': {'id':wishlistId}}}, function(err,docs){
                                    if (err) throw err;
                                    else console.log(docs);
                                  });
                                  console.log(res);
                                }
                                });
                                
                              }
                            });
                    }
                  });
                  })
              }
            }
        })
      }
    }
  });
}

