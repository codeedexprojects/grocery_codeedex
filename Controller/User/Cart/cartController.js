const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel');
const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');
const Coupon = require("../../../Models/Admin/Coupon/couponModel");
const CoinSettings = require('../../../Models/Admin/CoinSetting/coinSettingModel');
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

// Helper function to recalculate cart totals - UPDATED WITH DELIVERY CHARGE
async function recalculateCartTotals(cart) {
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let productDiscounts = 0;
  
  for (const item of cart.items) {
    if (item.isCombo && item.comboOffer) {
      const comboOffer = await ComboOffer.findById(item.comboOffer).populate('products.productId');
      if (comboOffer) {
        const originalPrice = comboOffer.products.reduce((sum, productItem) => {
          const product = productItem.productId;
          let price = product.price;
          
          if (productItem.weight) {
            const weightStock = product.weightsAndStocks.find(
              ws => ws.weight === productItem.weight && ws.measurm === productItem.measurm
            );
            if (weightStock) price = weightStock.weight_price;
          }
          
          return sum + (price * productItem.quantity);
        }, 0);
        
        const discountPerItem = originalPrice - item.price;
        productDiscounts += discountPerItem * item.quantity;
      }
    }
  }
  
  cart.discount = productDiscounts;
  
  
  const amountAfterDiscounts = cart.subtotal - cart.discount - cart.couponDiscount;
  
  
  cart.deliveryCharge = await calculateDeliveryCharge(amountAfterDiscounts);
  
  
  cart.total = amountAfterDiscounts + cart.deliveryCharge;
  
  if (cart.total < 0) cart.total = 0;
}

// Add to Cart - Updated with delivery charge recalculation
exports.addToCart = async (req, res) => {
  try {
    const { productId, comboOfferId, weight, measurm, quantity } = req.body;
    const userId = req.user._id;
    
    if (!productId && !comboOfferId) {
      return res.status(400).json({ message: 'Either productId or comboOfferId is required' });
    }
    
    let cart = await Cart.findOne({ user: userId });
    let itemPrice = 0;
    let isCombo = false;

    if (comboOfferId) {
      const comboOffer = await ComboOffer.findById(comboOfferId).populate('products.productId');
      if (!comboOffer) return res.status(404).json({ message: 'Combo offer not found' });
      
      let comboPrice = 0;
      const totalOriginalPrice = comboOffer.products.reduce((sum, item) => {
        const product = item.productId;
        let price = product.price;
        
        if (item.weight) {
          const weightStock = product.weightsAndStocks.find(
            ws => ws.weight === item.weight && ws.measurm === item.measurm
          );
          if (weightStock) price = weightStock.weight_price;
        }
        
        return sum + (price * item.quantity);
      }, 0);
      
      if (comboOffer.discountType === 'percentage') {
        comboPrice = totalOriginalPrice * (1 - comboOffer.discountValue / 100);
      } else {
        comboPrice = totalOriginalPrice - comboOffer.discountValue;
      }
      
      itemPrice = comboPrice;
      isCombo = true;
    } else {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      
      itemPrice = product.price;
      if (weight) {
        const weightStock = product.weightsAndStocks.find(
          w => w.weight === weight && w.measurm === measurm
        );
        if (weightStock) itemPrice = weightStock.weight_price;
      }
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        deliveryCharge: 0,
        total: 0
      });
    }

    if (comboOfferId) {
      const existingCombo = cart.items.find(
        item => item.comboOffer && item.comboOffer.toString() === comboOfferId
      );

      if (existingCombo) {
        existingCombo.quantity += quantity || 1;
      } else {
        cart.items.push({
          comboOffer: comboOfferId,
          price: itemPrice,
          quantity: quantity || 1,
          isCombo: true
        });
      }
    } else {
      const existingItem = cart.items.find(
        item => !item.isCombo &&
               item.product.toString() === productId &&
               item.weight === weight &&
               item.measurm === measurm
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({
          product: productId,
          weight,
          measurm,
          quantity: quantity || 1,
          price: itemPrice,
          isCombo: false
        });
      }
    }

    await recalculateCartTotals(cart);
    await cart.save();
    
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply Coupon - Updated with delivery charge recalculation
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const coupon = await Coupon.findOne({ code, status: "active" })
      .populate("applicableCategories")
      .populate("applicableProducts");

    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (coupon.oneTimeUse && coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    let applicableAmount = 0;
    cart.items.forEach(item => {
      const product = item.product;
      if (!product) return;

      if (
        (coupon.applicationType === "category" &&
          coupon.applicableCategories.some(cat => cat._id.equals(product.category))) ||
        (coupon.applicationType === "product" &&
          coupon.applicableProducts.some(p => p._id.equals(product._id))) ||
        coupon.applicationType === "all"
      ) {
        applicableAmount += item.price * item.quantity;
      }
    });

    if (applicableAmount <= 0) {
      return res.status(400).json({ message: "Coupon not applicable to these items" });
    }

    let couponDiscount = 0;
    if (coupon.discountType === "percentage") {
      couponDiscount = (applicableAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      couponDiscount = Math.min(applicableAmount, coupon.discountValue);
    }

    cart.couponDiscount = couponDiscount;
    cart.appliedCoupon = {
      code: coupon.code,
      discount: couponDiscount,
      couponId: coupon._id
    };

    await recalculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: couponDiscount
      },
      cart: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        couponDiscount: cart.couponDiscount,
        deliveryCharge: cart.deliveryCharge,
        total: cart.total
      }
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Coupon - Updated with delivery charge recalculation
exports.removeCoupon = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!cart.appliedCoupon) {
      return res.status(400).json({ message: "No coupon applied to this cart" });
    }

    cart.appliedCoupon = undefined;
    cart.couponDiscount = 0;

    await recalculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      message: "Coupon removed successfully",
      cart: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        couponDiscount: cart.couponDiscount,
        deliveryCharge: cart.deliveryCharge,
        total: cart.total
      }
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Cart - Updated to separate combo offers from regular items
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .populate('appliedCoupon.couponId');

    const coinSettings = await CoinSettings.findOne().sort({ createdAt: -1 });

    if (!cart) {
      return res.status(200).json({
        success: true,
        user: userId,
        items: [],
        comboOffers: [],
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        deliveryCharge: 0,
        total: 0,
        appliedCoupon: null,
        settings: coinSettings || null
      });
    }

    // Separate regular items and combo offers
    const regularItems = cart.items.filter(item => !item.isCombo);
    const comboItems = cart.items.filter(item => item.isCombo);

    // Transform combo items to combo offers format
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
      // Add cart-specific fields
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.price * item.quantity
    }));

    const response = {
      success: true,
      _id: cart._id,
      user: cart.user,
      items: regularItems,
      comboOffers: comboOffers,
      subtotal: cart.subtotal,
      discount: cart.discount,
      couponDiscount: cart.couponDiscount,
      deliveryCharge: cart.deliveryCharge,
      total: cart.total,
      appliedCoupon: cart.appliedCoupon || null,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      __v: cart.__v,
      settings: coinSettings || null
    };

    res.status(200).json(response);

  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove Cart Item - Updated with combo offer support and better error handling
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, comboOfferId, weight, measurm } = req.body;
    const userId = req.user._id;

    // Validate input - either productId or comboOfferId should be provided
    if (!productId && !comboOfferId) {
      return res.status(400).json({ 
        message: 'Either productId or comboOfferId is required' 
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Store original length to check if item was found
    const originalLength = cart.items.length;

    if (comboOfferId) {
      // Remove combo offer item
      cart.items = cart.items.filter(
        item => !(item.isCombo && item.comboOffer && item.comboOffer.toString() === comboOfferId.toString())
      );
    } else {
      // Remove regular product item
      cart.items = cart.items.filter(
        item => !(
          !item.isCombo &&
          item.product && 
          item.product.toString() === productId.toString() &&
          item.weight === weight &&
          item.measurm === measurm
        )
      );
    }

    // Check if any item was actually removed
    if (cart.items.length === originalLength) {
      return res.status(404).json({ 
        message: comboOfferId ? 'Combo offer not found in cart' : 'Product not found in cart' 
      });
    }

    // If cart is empty after removal, reset all totals
    if (cart.items.length === 0) {
      cart.subtotal = 0;
      cart.discount = 0;
      cart.couponDiscount = 0;
      cart.deliveryCharge = 0;
      cart.total = 0;
      cart.appliedCoupon = undefined;
    } else {
      // Recalculate totals for remaining items
      await recalculateCartTotals(cart);
    }

    await cart.save();
    
    res.status(200).json({ 
      message: comboOfferId ? 'Combo offer removed from cart' : 'Item removed from cart', 
      cart 
    });
  } catch (err) {
    console.error('Remove Cart Item Error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// Also update the updateCartItem function to handle combo offers
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, comboOfferId, weight, measurm, quantity } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId && !comboOfferId) {
      return res.status(400).json({ 
        message: 'Either productId or comboOfferId is required' 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        message: 'Quantity must be at least 1' 
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    let item;

    if (comboOfferId) {
      // Find combo offer item
      item = cart.items.find(
        i => i.isCombo && i.comboOffer && i.comboOffer.toString() === comboOfferId.toString()
      );
    } else {
      // Find regular product item
      item = cart.items.find(
        i => !i.isCombo &&
             i.product && 
             i.product.toString() === productId.toString() &&
             i.weight === weight &&
             i.measurm === measurm
      );
    }

    if (!item) {
      return res.status(404).json({ 
        message: comboOfferId ? 'Combo offer not found in cart' : 'Product not found in cart' 
      });
    }

    item.quantity = quantity;
    
    await recalculateCartTotals(cart);
    await cart.save();
    
    res.status(200).json({ 
      message: comboOfferId ? 'Combo offer quantity updated' : 'Cart item updated', 
      cart 
    });
  } catch (err) {
    console.error('Update Cart Item Error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};