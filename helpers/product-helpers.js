var db=require('../config/connection')
var collection=require('../config/collections');
const { response } = require('express');
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
        product.Price=parseInt(product.Price)
        
        console.log(product);

        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })
    },
    getAllProducts:()=>{
         return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection('product').find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)

            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        proDetails.Price=parseInt(proDetails.Price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Price:proDetails.Price,
                    Description:proDetails.Description
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}