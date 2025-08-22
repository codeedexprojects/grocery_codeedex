const Order = require('../../../Models/User/Order/orderModel');
const Checkout = require('../../../Models/User/Checkout/checkoutModel');
const Cart = require('../../../Models/User/Cart/cartModel');
const User = require('../../../Models/User/Auth/authModel')
const CoinSettings = require('../../../Models/Admin/CoinSetting/coinSettingModel')

// Create order from checkout - UPDATED WITH DELIVERY CHARGE INTEGRATION
exports.createOrder = async (req, res) => {
  try {
    const { checkoutId, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;
    
    const checkout = await Checkout.findOne({ _id: checkoutId, user: userId })
      .populate({
        path: 'cart',
        populate: [
          { path: 'items.product' },
          { path: 'items.comboOffer' }
        ]
      });
    
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    
    const cart = checkout.cart;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (checkout.coinsUsed > 0) {
      if (user.coins < checkout.coinsUsed) {
        return res.status(400).json({ 
          message: 'Insufficient coins', 
          availableCoins: user.coins,
          requiredCoins: checkout.coinsUsed
        });
      }
    }
    
    const order = new Order({
      user: userId,
      items: cart.items,
      subtotal: checkout.subtotal || cart.subtotal,
      discount: checkout.discount || cart.discount,
      couponDiscount: checkout.couponDiscount || cart.couponDiscount,
      coinDiscount: checkout.coinDiscount || 0,
      coinsUsed: checkout.coinsUsed || 0,
      deliveryCharge: checkout.deliveryCharge || cart.deliveryCharge || 0,  
      total: checkout.total || cart.total,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD'
    });

    await order.save();

    if (checkout.coinsUsed > 0) {
      await User.findByIdAndUpdate(userId, { 
        $inc: { coins: -checkout.coinsUsed } 
      });
    }

    const settings = await CoinSettings.findOne();
    if (settings) {
      const { purchaseThreshold, coinsPerThreshold } = settings;

      const orderAmountForCoins = order.subtotal - order.discount - order.couponDiscount - order.coinDiscount;
      const thresholdsMet = Math.floor(orderAmountForCoins / purchaseThreshold);
      const coinsEarned = thresholdsMet * coinsPerThreshold;

      if (coinsEarned > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { coins: coinsEarned } });
      }

      order.coinsEarned = coinsEarned; 
      await order.save();
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id, 
      { 
        $set: {
          items: [], 
          subtotal: 0, 
          discount: 0,
          couponDiscount: 0,
          coinDiscount: 0,      
          coinsUsed: 0,
          deliveryCharge: 0,   
          total: 0
        },
        $unset: { appliedCoupon: "" }
      },
      { new: true } 
    );

    await Checkout.findByIdAndUpdate(checkoutId, {
      $set: {
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        coinDiscount: 0,
        coinsUsed: 0,
        deliveryCharge: 0,    
        total: 0,
        status: 'completed'
      }
    });

    
    const updatedUser = await User.findById(userId).select('coins');

    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      cart: updatedCart,
      userCoins: updatedUser.coins,
      coinsUsedForOrder: checkout.coinsUsed,
      coinsEarned: order.coinsEarned || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('items.product')
      .populate('items.comboOffer')
      .populate('user', 'name email');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin use)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};