// routes/walletRoutes.js
const express = require("express");
const router = express.Router();
const walletController = require("../../../Controller/User/Wallet/walletController");
const verifyToken = require('../../../Middlewares/jwtMiddleware')

router.get("/balance",verifyToken(['user']), walletController.getWalletBalance);
router.get("/transactions",verifyToken(['user']), walletController.getWalletTransactions);


module.exports = router;
