const { response } = require('express');
var express = require('express');
const session = require('express-session');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper =require('../helpers/product-helpers')
const adminHelpers=require('../helpers/admin-helpers')
const verifyAdminLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}



/* GET users listing. */
router.get('/',verifyAdminLogin,function(req, res, next) {
  productHelpers.getAllProducts().then((products)=>{
    console.log(products);
    res.render('admin/view-products',{admin:true,products});

  })
});

router.get('/admin-login',async(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/')
  }else{

    let count=await adminHelpers.secondAdmin()
    res.render('admin/admin-login',{'loginErr':req.session.adminLoginErr,count})
    req.session.adminLoginErr=false 
  }
})
router.get('/register',async(req,res)=>{
  let count=await adminHelpers.secondAdmin()
  if(count){
  res.render('admin/register',{admin:true})
  }else{
    res.redirect('/admin/admin-login')
  
  }
})
router.post('/register',(req,res)=>{
  adminHelpers.doRegister(req.body).then((response)=>{
    console.log(response);
    
    req.session.admin=response
    req.session.admin.loggedIn=true
    res.redirect('/admin/')
  })
})
router.post('/admin-login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.admin=response.admin
      console.log(req.session.admin);
      req.session.adminLoggedIn=true
      res.redirect('/admin/')
    }else{
      req.session.adminLoginErr=true
      res.redirect('/admin/admin-login')
    }
  })
})



router.get('/add-product',function(req,res){
  res.render('admin/add-product')

})
router.post('/add-product',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    console.log(id);
    image.mv('./public/product-images/'+id+'.png',(err,done)=>{
      if(err){
        res.render('admin/add-product')
        
      }else{
        console.log(err)
      }
    })
    
  })
})
router.get('/delete-product/:id',(req,res)=>{ 
    let proId=req.params.id
    console.log(proId);
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/')
    })
})
router.get('/edit-product/:id',async (req,res)=>{ 
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.png') 
    }
  })
})

router.get('/admin-logout',(req,res)=>{
  req.session.admin=null
  req.session.adminLoggedIn=false
  res.redirect('/admin/admin-login')
})

router.get('/adminOrders',async(req,res)=>{
  let orders=await adminHelpers.getOrders()
  res.render('admin/orders',{orders,admin:true})
})

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await adminHelpers.getOrdersProducts(req.params.id)
  res.render('admin/view-order-products',{admin:true,products})
})

module.exports = router;
