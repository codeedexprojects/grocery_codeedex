const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel');
const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');
const Coupon = require("../../../Models/Admin/Coupon/couponModel")


exports.addToCart = async (req, res) => {
  try {
    const { productId, comboOfferId, weight, measurm, quantity } = req.body;
    const userId = req.user._id;
    if (!productId && !comboOfferId) {
      return res.status(400).json({ message: 'Either productId or comboOfferId is required' });
    }
    let cart = await Cart.findOne({ user: userId });
    if (comboOfferId) {
      const comboOffer = await ComboOffer.findById(comboOfferId).populate('products.productId');
      if (!comboOffer) return res.status(404).json({ message: 'Combo offer not found' });
    
      let comboPrice = 0;
      if (comboOffer.discountType === 'percentage') {
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
        
        comboPrice = totalOriginalPrice * (1 - comboOffer.discountValue / 100);
      } else {
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
        
        comboPrice = totalOriginalPrice - comboOffer.discountValue;
      }

      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [{
            comboOffer: comboOfferId,
            price: comboPrice,
            quantity: quantity || 1,
            isCombo: true
          }],
          totalPrice: comboPrice * (quantity || 1)
        });
      } else {
        const existingCombo = cart.items.find(
          item => item.comboOffer && item.comboOffer.toString() === comboOfferId
        );

        if (existingCombo) {
          existingCombo.quantity += quantity || 1;
        } else {
          cart.items.push({
            comboOffer: comboOfferId,
            price: comboPrice,
            quantity: quantity || 1,
            isCombo: true
          });
        }

        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    } else {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      
      let price = product.price;
      if (weight) {
        const weightStock = product.weightsAndStocks.find(
          w => w.weight === weight && w.measurm === measurm
        );
        if (weightStock) price = weightStock.weight_price;
      }

      if (!cart) {
        cart = new Cart({
          user: userId,
          items: [{
            product: productId,
            weight,
            measurm,
            quantity: quantity || 1,
            price,
            isCombo: false
          }],
          totalPrice: price * (quantity || 1)
        });
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
            price,
            isCombo: false
          });
        }

        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    }
    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (applicableAmount * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = Math.min(applicableAmount, coupon.discountValue);
    }

    
    const grandTotal = cart.totalPrice - discount;

    cart.totalDiscount = discount;
    cart.grandTotal = grandTotal; 
    cart.appliedCoupon = {
      code: coupon.code,
      discount: discount,
      couponId: coupon._id
    };

    await cart.save();

    res.status(200).json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount
      },
      totalPrice: cart.totalPrice,
      grandTotal: grandTotal
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
    cart.totalDiscount = 0;
    cart.grandTotal = cart.totalPrice; 

    await cart.save();

    res.status(200).json({
      message: "Coupon removed successfully",
      cart: {
        totalPrice: cart.totalPrice,
        totalDiscount: 0,
        grandTotal: cart.totalPrice
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
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .populate('appliedCoupon.couponId');

    if (!cart) {
      return res.status(200).json({
        user: userId,
        items: [],
        totalPrice: 0,
        totalDiscount: 0,
        grandTotal: 0,
        appliedCoupon: null
      });
    }

    let totalDiscount = cart.totalDiscount || 0;
    const updatedItems = await Promise.all(cart.items.map(async (item) => {
      if (item.isCombo && item.comboOffer) {
        const comboOffer = item.comboOffer;
        await comboOffer.populate('products.productId');
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
        
        const discountAmount = originalPrice - item.price;
        totalDiscount += discountAmount * item.quantity;
        
        return {
          ...item.toObject(),
          originalPrice,
          discountAmount
        };
      }
      return item;
    }));
    
    cart.items = updatedItems;
    cart.totalDiscount = totalDiscount;
    
    
    const grandTotal = cart.totalPrice - (cart.appliedCoupon ? cart.appliedCoupon.discount : 0);
    
    res.status(200).json({
      ...cart.toObject(),
      grandTotal: grandTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .populate('appliedCoupon.couponId');

    if (!cart) {
      return res.status(200).json({
        user: userId,
        items: [],
        totalPrice: 0,
        totalDiscount: 0,
        grandTotal: 0,
        appliedCoupon: null
      });
    }

  
    let totalComboDiscount = 0;
    const updatedItems = await Promise.all(cart.items.map(async (item) => {
      if (item.isCombo && item.comboOffer) {
        const comboOffer = item.comboOffer;
        await comboOffer.populate('products.productId');
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
        
        const discountAmount = originalPrice - item.price;
        totalComboDiscount += discountAmount * item.quantity;
        
        return {
          ...item.toObject(),
          originalPrice,
          discountAmount
        };
      }
      return item.toObject();
    }));

    
    const couponDiscount = cart.appliedCoupon ? cart.appliedCoupon.discount : 0;
    const totalDiscount = totalComboDiscount + couponDiscount;
    
    
    const grandTotal = cart.grandTotal || (cart.totalPrice - couponDiscount);
    
    res.status(200).json({
      _id: cart._id,
      user: cart.user,
      items: updatedItems,
      totalPrice: cart.totalPrice,
      totalDiscount: totalDiscount,
      appliedCoupon: cart.appliedCoupon,
      grandTotal: grandTotal, 
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      __v: cart.__v
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

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

    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    res.status(200).json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
