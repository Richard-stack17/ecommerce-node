const Cart = require("../models/cart.model");
const ProductInCart = require("../models/productInCart.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


exports.validExistCart = catchAsync( async(req,res,next) => {
    const {sessionUser} = req;

    let cart = await Cart.findOne({
        where: {
            userId : sessionUser.id,
            status:'active',
        },
    }); //let porque vamos a reasignar el el cart en el if de abajo

    if(!cart){
        cart = await Cart.create({
            userId: sessionUser.id
        })
    }

    req.cart = cart;
    next();
});

exports.ValidExistProductInCart = catchAsync(async (req, res, next) => {
    const { product, cart } = req;
  
    const productInCart = await ProductInCart.findOne({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    });
  
    if (productInCart && productInCart.status === 'removed') {
      await productInCart.update({ status: 'active' });
      return res.status(200).json({
        status: 'success',
        message: 'Product successfully added',
      });
    }
  
    if (productInCart) {
      return next(new AppError('This product already exists in the cart', 400));
    }
  
    req.productInCart = productInCart;
    next();
  });

  exports.validExistProductInCartForUpdate = catchAsync(async (req,res,next) =>{
    const {sessionUser} = req; //esto para buscar en el carrito del usuario
    const {productId} = req.body; //para validar si el producto existe en el productInCart

    const cart = await Cart.findOne({
      where:{ //esto para traer los peroductos del carrito
        userId: sessionUser.id,
        status:'active'
      }
    })

    const productInCart = await ProductInCart.findOne({
      where:{
        cartId: cart.id,
        productId
      }
    })
    
    if(!productInCart){
      return next(new AppError("The product does not exist in the cart", 400))
    }

    req.productInCart = productInCart; //se adjunta el productInCart

    next()
  });

  exports.validExistProductInCartByParamsForUpdate = catchAsync(async (req,res,next) => {
    const {sessionUser} = req;
    const {productId} = req.params;

    const cart = await Cart.findOne({
      where:{
        userId: sessionUser.id,
        status: 'active',
      }
    });

    const productInCart = await ProductInCart.findOne({
      where:{
        cartId: cart.id,
        productId,
        status: 'active',
      },
    });

    if(!productInCart) {
      return next(new AppError('The product does not exist in the cart', 400))
    }

    req.productInCart = productInCart;

    next();
  })

