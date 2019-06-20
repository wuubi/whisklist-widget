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

/* kickOff().catch();
async function kickOff(){
  await new Promise((resolve) => {
  getWishlists((err) => {
    if(err){
      console.log(err);
    }
    else{
      console.log("wishlists got");
      resolve();
      }
  },0);
  });
  await new Promise((resolve) => {
    getProducts((err) => {
      if(err){
        reject(err);
      }
      else{
        console.log("products got");
        resolve();
        }
    },0);
    });
}
*/
// This stuff doesn't work right ^^ only getWishlists is run, doesn't seem to actually resolve, likely due to a Promise not being returned correctly?
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

const getWishlists = new Promise (function (){
  bigCommerce.get('/wishlists')
  .then(data => {
    Arr = data.data;
    let wArr = [];
    for(let [key, value] of Object.entries(Arr)){
        
        if(value.id){
            wArr.push(value.id);
        }
    }
    e();
    async function e(){for(i=0; i < wArr.length; i++){
        await bigCommerce.get('/wishlists/'+ wArr[i]).then(data => {
            wishlistsArr = [];
            wishlistsArr = data.data;
            console.log(wishlistsArr.id + "LINE 148");
            
            Wishlist.collection.findOne({"id":wishlistsArr.id}, null, function(err, docs){
              if (docs === null){
                
              Wishlist.collection.insertOne(data.data, function(err, res) {
                if (err) throw err;
                console.log('Number of documents inserted: ' + res.insertedCount);
                
              });
              if (err) throw err;
            }
          });
        });
    }}
});
});

const getProducts = new Promise (function (){
    bigCommerce.get('/catalog/products').then(data =>{
        Arr = data.data;
        let pArr = [];
        for([key, value] of Object.entries(Arr)){
            if (value.id){
                pArr.push(value.id);
            }
        }
        console.log(pArr);
        e();
        async function e(){
        for(i=0;i < pArr.length; i++){
            await Wishlist.collection.find({'items.product_id':pArr[i]}, null, function(err, docs){
                if(docs === null){
                    console.log("no products found");
                }
                if(docs){
                    console.log(docs.id);
                }
                if(err) throw err;
            })
        }
      }
    })
    
});


getWishlists.then(()=>{getProducts.catch(err)});