const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel');
const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');


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

// Get Cart (updated to populate combo offers)
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer');
    
    if (!cart) return res.status(404).json({ message: 'Cart is empty' });
    
    // Calculate total discount for combo offers
    let totalDiscount = 0;
    
    const updatedItems = await Promise.all(cart.items.map(async (item) => {
      if (item.isCombo && item.comboOffer) {
        // Calculate original price of combo products
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
    
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart is empty' });
    res.status(200).json(cart);
  } catch (err) {
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
