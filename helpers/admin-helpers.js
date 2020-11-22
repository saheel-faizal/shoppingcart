var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { create } = require('hbs')
var objectId = require('mongodb').ObjectID

module.exports = {
    doRegister: (admin) => {
        return new Promise(async (resolve, reject) => {
            admin.Password = await bcrypt.hash(admin.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(admin).then((data) => {
                resolve(data.ops[0])
            })


        })

    },
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log('login success');
                        response.admin=admin

                        response.status=true
                        resolve(response)

                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }

                })
            }else{
                console.log('login failed');
                resolve({status:false})
            }
            
        })
    },
    secondAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
           
         let number= await db.get().collection(collection.ADMIN_COLLECTION).count().then((number)=>{
           if(number<=0){
               let count=true
               resolve(count)
           }else{
               let count=false
               resolve(count)
           }
             
        })
        })
       
      },

      getOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let orders=await db.get().collection(collection.ORDER_COLLECTION)
                .find().toArray()
                console.log(orders);
                resolve(orders)
        })
    },
    getOrdersProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            console.log(orderItems);
            resolve(orderItems)
        })
    },
}