const { Router } = require('express');
const { check } = require('express-validator');
const {
  addProductToCart,
  updateCart,
  removeProductToCart,
  buyProductOnCart,
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');
const {
  validExistCart,
  ValidExistProductInCart,
  validExistProductInCartForUpdate,
} = require('../middlewares/cart.middleware');
const {
  validBodyProductById,
  validIfExistProductsInStock,
  validExistProductInStockForUpdate,
  validExistProductIdByParams,
} = require('../middlewares/product.middlewares');
const { validateFields } = require('../middlewares/validateField.middleware');

const router = Router();

router.use(protect); //porque para que haga la compra el usuario debe estar logueado

router.post(
  '/add-product',
  [
    check('productId', 'The productId is required').not().isEmpty(),
    check('productId', 'The productId must be a number').isNumeric(),
    check('quantity', 'The quantity is required').not().isEmpty(),
    check('quantity', 'The quantity must be a number').isNumeric(),
    validateFields,
    validBodyProductById,
    validIfExistProductsInStock,
    validExistCart,
    ValidExistProductInCart,
  ],
  addProductToCart
);

router.patch(
  '/update-cart',
  [
    check('productId', 'The productId is required').not().isEmpty(),
    check('productId', 'The productId must be a number').isNumeric(),
    check('newQty', 'The quantity is required').not().isEmpty(),
    check('newQty', 'The quantity must be a number').isNumeric(),
    validateFields,
    validBodyProductById,
    validExistProductInStockForUpdate,
    validExistProductInCartForUpdate,
  ],
  updateCart
);

router.delete(
  '/:productId',
  validExistProductIdByParams,
  ValidExistProductInCart,
  removeProductToCart
);

router.post('/purchase', buyProductOnCart); //lo hacemos todo el controlador ya que puede ser que haya confusiones

module.exports = {
  cartRouter: router,
};
