const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


const Order = require("../models/order")
const Product = require("../models/product")



//-----------------------------------GET ALL ORDERS--------------------------------------
router.get('/', (req, res, next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product', 'name price')
    .exec()
    .then( docs => {
        res.status(200).json({
            count:docs.length,
            orders: docs.map( doc =>{
                return {
                    _id :doc._id,
                    product:doc.product,
                    quantity: doc.quantity,
                    request:{
                        type:'GET',
                        url:'https://node-js-projects-praveenck06.c9users.io/orders/'+doc._id
                    }
                }
            })
            
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

 

//_________________________________________CREATE NEW ORDER________________________________
router.post('/', (req, res, next)=>{
    Product.findById(req.body.productId)
    .then(product =>{
        
        if(!product){
            return res.status(404).json({
                message:"Product Not Found"
            })
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
        return order.save();
    })
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message:"Order Created!!",
            createdOrder:{
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request:{
                type:"GET",
                url:'https://node-js-projects-praveenck06.c9users.io/orders/'+result._id
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
    
    
});


// --------------------------------GET INDIVIDUAL ORDER-----------------------------------
router.get('/:orderId', (req, res, next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then( order => {
        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }
        res.status(200).json({
            order:order._id,
            request:{
                type:"GET",
                url:'https://node-js-projects-praveenck06.c9users.io/orders/'
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
});


//---------------------------------DELETE ORDER-------------------------------------------
router.delete('/:orderId', (req, res, next)=>{
   Order.remove({_id:req.params.orderId})
   .exec()
   .then( result => {
       res.status(200).json({
           message:"Order Deleted"
       })
   })
   .catch( err => {
       res.status(500).json({
           error:err
       })
   })
});

module.exports =router;