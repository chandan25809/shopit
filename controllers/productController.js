const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
//create new product => /api/v1/admin/product/new
exports.newProduct= async(req,res,next)=>{
    req.body.user = req.user._id;
    
    const product=await Product.create(req.body)
    // const {
    //     name,
    //     price,
    //     description,
    //     ratings,
    //     images,
    //     category,
    //     seller,
    //     stock,
    //     numOfReviews,
    //     reviews
    // } = req.body;
    // const product = await Product.create({
    //     name,
    //     price,
    //     description,
    //     ratings,
    //     images,
    //     category,
    //     seller,
    //     stock,
    //     numOfReviews,
    //     reviews,
    //     user: req.user._id
    // })
    res.status(201).json({
        sucess:true,
        product
    })
}
// Get all products   =>   /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()

    let products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    apiFeatures.pagination(resPerPage)
    products = await apiFeatures.query;


    res.status(200).json({
        success: true,
        productsCount,
        resPerPage,
        filteredProductsCount,
        products
    })

})

//Get single product product details => /api/v1/product/:id
exports.getSingleProduct=async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler('Product not found',404))
    }
    
    // if(!product){
    //     return    res.status(404).json({
    //         sucess:false,
    //         message:"Product not found"
    //     })
    // }
    res.status(200).json({
        sucess: true,
        product
    })
}

//Update Product=> /api/v1/admin/product/:id
exports.updateProduct = async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product){
        return res.status(404).json({
            sucess:false,
            message:"Product not found"
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        sucess: true,
        product
    })
}
//Delete Product=> /api/v1/admin/product/:id
exports.deleteProduct = async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(404).json({
            sucess:false,
            message:"Product not found"
        })
    } 
    await product.remove();
    res.status(200).json({
        sucess: true,
        message:'Product is deleted.'
    })
}

// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true
    })

})


// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    console.log(product);
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;
    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true
    })
})