const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");



const storage = multer.diskStorage({
   destination: function(req, file, cb){
      cb(null,'./uploads/');
   },
   filename: function(req,file,cb){
      cb(null,new Date().toISOString()+ file.originalname);
   }
});

const fileFilter = (req, file, cb) =>{
  
  if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'){
     cb(null, true);
  }else{
     // reject a file
  cb(null, false);
  }
  
  
  
};

const upload = multer({
   storage:storage, 
   limits: {
      fileSize: 1024*1024*6
   },
   fileFilter:fileFilter
   
});

const Product = require("../models/product")



// -----------------------------------GET ALL PRODUCTS--------------------------------------

router.get('/',(req , res , next) => {
   Product.find()
   .select('name price _id productImage')
   .exec()
   .then(docs =>{
      const response ={
         count : docs.length,
         products: docs.map(doc => {
            return{
               name: doc.name,
               price: doc.price,
               _id: doc._id,
               productImage:doc.productImage,
               request:{
                  type:"GET",
                  url:"https://node-js-projects-praveenck06.c9users.io/products/"+doc._id
               }
            
            }
         })
      }
      // if(docs.length>=0){
         res.status(200).json(response);
      // }else{
      //    res.status(404).json({
      //       message:"no entries found"
      //    })
      // }
      
   })
   .catch(err => {
      console.log(err);
      res.status(500).json({
         error:err
      })
   });
});


//----------------------------------CREATE NEW PRODUCT------------------------------------------

router.post('/', upload.single('productImage'),(req , res , next) => {
   console.log(req.file);
   const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price,
      productImage:req.file.path
   });
   product.save().then(result => {
      console.log(result);
      res.status(201).json({
         message: 'Created product !!!',
         createdProduct: {
            name: result.name,
            price:result.price,
            _id:result._id,
            request:{
               type:"GET",
               url:"https://node-js-projects-praveenck06.c9users.io/products/"+result._id
            }
         }
      }); 
   }).catch(err => {
      console.log(err);
      res.status(500).json({
         error:err
      })
   });
});



// ------------------------GET SPECIFIC PRODUCT-------------------------------------
router.get('/:productId', (req , res , next) => {
   const id =req.params.productId;
   Product.findById(id)
   .select('name price _id productImage')
   .exec()
   .then(doc => {
      console.log(doc);
      if(doc){
         res.status(200).json(doc);
         // add url to get all products
      }else{
         res.status(404).json({message:'no valid entry found for thos id'})
      }
      
   })
   .catch(err => {
      console.log(err);
      res.status(500).json({error :err })
   })
});


// ---------------------------------UPDATE PRODUCT-------------------------------------------------
router.patch('/:productId', (req , res , next) => {
   const id = req.params.productId;
   const updateOps={};
   for(const ops of req.body){
      updateOps[ops.propName]=ops.value;
   }
   Product.update({_id:id},{$set:updateOps })
   .exec()
   .then(result => {
      res.status(200).json({
         message:'Product Updated',
         request:{
            type:'GET',
            url:"https://node-js-projects-praveenck06.c9users.io/products/"+id
         }
      })
   })
   .catch(err => {
      res.status(500).json({
         error:err
      })
   });
});


// ----------------------------------DELETE PRODUCT------------------------------------
router.delete('/:productId', (req , res , next) => {
   const id = req.params.productId;
   Product.remove({_id:id}).exec()
   .then(result => {
      res.status(200).json({
         message:"Product Deleted!!!!"
         // can add url to create new product
      })
   })
   .catch(err =>{
      console.log(err);
      res.status(500).json({error:err});
   })
});

module.exports = router;