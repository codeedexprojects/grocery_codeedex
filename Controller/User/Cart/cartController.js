const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel');
const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');
const Coupon = require("../../../Models/Admin/Coupon/couponModel");
const CoinSettings = require('../../../Models/Admin/CoinSetting/coinSettingModel');

// Add to Cart - Updated with proper calculations
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
      
      // Calculate combo price
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

    // Recalculate cart totals
    await recalculateCartTotals(cart);
    await cart.save();
    
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply Coupon - Updated with proper calculations
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

    // Validate coupon
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (coupon.oneTimeUse && coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    // Calculate applicable amount for coupon
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

    // Calculate coupon discount
    let couponDiscount = 0;
    if (coupon.discountType === "percentage") {
      couponDiscount = (applicableAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      couponDiscount = Math.min(applicableAmount, coupon.discountValue);
    }

    // Update cart with coupon
    cart.couponDiscount = couponDiscount;
    cart.appliedCoupon = {
      code: coupon.code,
      discount: couponDiscount,
      couponId: coupon._id
    };

    // Recalculate totals
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
        total: cart.total
      }
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Coupon
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

    // Recalculate totals
    await recalculateCartTotals(cart);
    await cart.save();

    res.status(200).json({
      message: "Coupon removed successfully",
      cart: {
        subtotal: cart.subtotal,
        discount: cart.discount,
        couponDiscount: cart.couponDiscount,
        total: cart.total
      }
    });
  } catch (error) {
    console.error("Error removing coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user cart
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .populate('appliedCoupon.couponId');

    // Get coin settings (assuming you only have one settings doc)
    const coinSettings = await CoinSettings.findOne().sort({ createdAt: -1 });

    if (!cart) {
      return res.status(200).json({
        success: true,
        user: userId,
        items: [],
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        total: 0,
        appliedCoupon: null,
        settings: coinSettings || null
      });
    }

    res.status(200).json({
      success: true,
      ...cart.toObject(),
      settings: coinSettings || null
    });

  } catch (err) {
    console.error("Get Cart Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Cart Item
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, weight, measurm, quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      i => i.product.toString() === productId &&
           i.weight === weight &&
           i.measurm === measurm
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity = quantity;
    
    // Recalculate totals
    await recalculateCartTotals(cart);
    await cart.save();
    
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Cart Item
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, weight, measurm } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => !(i.product.toString() === productId &&
             i.weight === weight &&
             i.measurm === measurm)
    );

    // Recalculate totals
    await recalculateCartTotals(cart);
    await cart.save();
    
    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to recalculate cart totals
async function recalculateCartTotals(cart) {
  // Calculate subtotal (sum of all items)
  cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate product/combo discounts
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
  
  // Calculate total (subtotal - all discounts)
  cart.total = cart.subtotal - cart.discount - cart.couponDiscount;
  
  // Ensure total is not negative
  if (cart.total < 0) cart.total = 0;
}