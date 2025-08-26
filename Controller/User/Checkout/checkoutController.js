const Checkout = require('../../../Models/User/Checkout/checkoutModel');
const Cart = require('../../../Models/User/Cart/cartModel');
const { getCoinProgress } = require('../../../utils/coinProgress');
const User = require('../../../Models/User/Auth/authModel');
const DeliveryCharge = require('../../../Models/Admin/DeliveryCharge/deliveryChargeModel');

// Helper function to calculate delivery charge
async function calculateDeliveryCharge(orderAmount) {
  try {
    const rule = await DeliveryCharge.findOne({
      minAmount: { $lte: orderAmount },
      maxAmount: { $gte: orderAmount }
    });
    
    return rule ? rule.charge : 0;
  } catch (error) {
    console.error('Error calculating delivery charge:', error);
    return 0;
  }
}

exports.createCheckout = async (req, res) => {
  try {
    const { cartId } = req.body;
    const userId = req.user._id;

    if (!cartId) {
      return res.status(400).json({ message: 'Cart ID is required' });
    }

    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await Checkout.deleteMany({ cart: cartId, user: userId });

    const checkout = new Checkout({
      user: userId,
      cart: cartId,
      subtotal: cart.subtotal,
      discount: cart.discount,
      couponDiscount: cart.couponDiscount,
      deliveryCharge: cart.deliveryCharge, 
      coinDiscount: 0,
      coinsUsed: 0,
      total: cart.total
    });

    await checkout.save();

    res.status(201).json({ 
      message: 'Checkout created', 
      checkout 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply coins in checkout - UPDATED WITH DELIVERY CHARGE CONSIDERATION
exports.applyCoinsInCheckout = async (req, res) => {
  try {
    const { checkoutId, coinsToUse } = req.body;
    const userId = req.user._id;

    if (!checkoutId) {
      return res.status(400).json({ message: 'Checkout ID is required' });
    }

    if (!coinsToUse || coinsToUse <= 0) {
      return res.status(400).json({ message: 'Please enter a valid coin amount' });
    }

    const checkout = await Checkout.findOne({ _id: checkoutId, user: userId })
      .populate('cart');

    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.coins < coinsToUse) {
      return res.status(400).json({ 
        message: 'Insufficient coins', 
        availableCoins: user.coins,
        requested: coinsToUse
      });
    }

    const cart = checkout.cart;

    const afterDiscountsBeforeDelivery = cart.subtotal - cart.discount - cart.couponDiscount;
    const maxCoinsUsable = Math.floor(afterDiscountsBeforeDelivery); // 1 coin = 1 rupee
    
    if (coinsToUse > maxCoinsUsable) {
      return res.status(400).json({ 
        message: `You can use maximum ${maxCoinsUsable} coins for this order`,
        maxCoinsUsable: maxCoinsUsable
      });
    }

    checkout.coinsUsed = coinsToUse;
    checkout.coinDiscount = coinsToUse; 

    
    checkout.subtotal = cart.subtotal;
    checkout.discount = cart.discount;
    checkout.couponDiscount = cart.couponDiscount;
    checkout.deliveryCharge = cart.deliveryCharge;
    checkout.total = cart.subtotal - cart.discount - cart.couponDiscount - checkout.coinDiscount + cart.deliveryCharge;

    if (checkout.total < 0) checkout.total = 0;

    await checkout.save();

    res.status(200).json({
      message: 'Coins applied successfully',
      coinsUsed: checkout.coinsUsed,
      coinDiscount: checkout.coinDiscount,
      checkout: {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        couponDiscount: checkout.couponDiscount,
        coinDiscount: checkout.coinDiscount,
        coinsUsed: checkout.coinsUsed,
        deliveryCharge: checkout.deliveryCharge,
        total: checkout.total
      }
    });

  } catch (error) {
    console.error("Error applying coins in checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove coins from checkout - UPDATED WITH DELIVERY CHARGE CONSIDERATION
exports.removeCoinsFromCheckout = async (req, res) => {
  try {
    const { checkoutId } = req.body;
    const userId = req.user._id;

    if (!checkoutId) {
      return res.status(400).json({ message: 'Checkout ID is required' });
    }

    const checkout = await Checkout.findOne({ _id: checkoutId, user: userId })
      .populate('cart');

    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }

    if (checkout.coinsUsed === 0) {
      return res.status(400).json({ message: 'No coins applied to this checkout' });
    }

    
    checkout.coinsUsed = 0;
    checkout.coinDiscount = 0;

    const cart = checkout.cart;
    
   
    checkout.subtotal = cart.subtotal;
    checkout.discount = cart.discount;
    checkout.couponDiscount = cart.couponDiscount;
    checkout.deliveryCharge = cart.deliveryCharge;
    checkout.total = cart.subtotal - cart.discount - cart.couponDiscount + cart.deliveryCharge;

    if (checkout.total < 0) checkout.total = 0;

    await checkout.save();

    res.status(200).json({
      message: 'Coins removed successfully',
      checkout: {
        subtotal: checkout.subtotal,
        discount: checkout.discount,
        couponDiscount: checkout.couponDiscount,
        coinDiscount: checkout.coinDiscount,
        coinsUsed: checkout.coinsUsed,
        deliveryCharge: checkout.deliveryCharge,
        total: checkout.total
      }
    });

  } catch (error) {
    console.error("Error removing coins from checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCheckout = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const checkout = await Checkout.find({ user: userId })
      .populate({
        path: "cart",
        populate: [
          { path: "items.product" },
          { path: "items.comboOffer" }
        ]
      })
      .sort({ createdAt: -1 });

    if (!checkout || checkout.length === 0) {
      return res.status(404).json({ message: "No checkouts found" });
    }

    const latestCart = checkout[0].cart;

    // ✅ Separate regular items and combo offers (like getCart)
    const regularItems = latestCart.items.filter(item => !item.isCombo);
    const comboItems = latestCart.items.filter(item => item.isCombo);

    const comboOffers = comboItems.map(item => ({
      _id: item.comboOffer._id,
      name: item.comboOffer.name,
      category: item.comboOffer.category,
      image: item.comboOffer.image,
      products: item.comboOffer.products,
      discountType: item.comboOffer.discountType,
      discountValue: item.comboOffer.discountValue,
      startDate: item.comboOffer.startDate,
      endDate: item.comboOffer.endDate,
      isActive: item.comboOffer.isActive,
      createdAt: item.comboOffer.createdAt,
      updatedAt: item.comboOffer.updatedAt,
      // cart-specific
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity
    }));

    // coin progress
    const coinProgress = await getCoinProgress(latestCart, user);

    res.status(200).json({
      checkoutId: checkout[0]._id,
      items: regularItems,
      comboOffers,  // ✅ separate outside
      subtotal: checkout[0].subtotal,
      discount: checkout[0].discount,
      couponDiscount: checkout[0].couponDiscount,
      coinDiscount:checkout[0].coinDiscount,
      deliveryCharge: checkout[0].deliveryCharge,
      total: checkout[0].total,
      appliedCoupon: latestCart.appliedCoupon || null,
      coinProgress,
      userCoins: user.coins,
      createdAt: checkout[0].createdAt,
    });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};