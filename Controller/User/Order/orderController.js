const Order = require('../../../Models/User/Order/orderModel');
const Checkout = require('../../../Models/User/Checkout/checkoutModel');
const Cart = require('../../../Models/User/Cart/cartModel');

// Create order from checkout
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
    
    const order = new Order({
      user: userId,
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      couponDiscount: cart.couponDiscount,
      total: cart.total,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD'
    });

    await order.save();

    // Clear the cart
    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id, 
      { 
        $set: {
          items: [], 
          subtotal: 0, 
          discount: 0,
          couponDiscount: 0,
          total: 0
        },
        $unset: {
          appliedCoupon: "" 
        }
      },
      { new: true } 
    );

    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      cart: updatedCart 
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