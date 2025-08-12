const express = require('express');
const router = express.Router();
const wishlistController = require('../../../Controller/User/Wishlist/wishlistController');
const jwtVerify = require('../../../Middlewares/jwtMiddleware')

router.post('/create', jwtVerify(['user']), wishlistController.addToWishlist);

router.delete('/remove/:productId', jwtVerify(['user']), wishlistController.removeFromWishlist);

router.get('/get', jwtVerify(['user']), wishlistController.getWishlist);

router.delete('/delete', jwtVerify(['user']), wishlistController.clearWishlist);

module.exports = router;