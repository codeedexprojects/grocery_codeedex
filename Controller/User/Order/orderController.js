const Order = require('../../../Models/User/Order/orderModel');
const Cart = require('../../../Models/User/Cart/cartModel');
const Checkout = require('../../../Models/User/Checkout/checkoutModel');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { checkoutId, address, paymentMethod } = req.body;
    if (!checkoutId) {
      return res.status(400).json({ message: 'Checkout ID is required' });
    }
    const checkout = await Checkout.findOne({ _id: checkoutId })
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
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = new Order({
      user: userId,
      items: cart.items,
      totalPrice,
      totalDiscount: cart.totalDiscount,
      paymentMethod: paymentMethod || 'COD',
      address,
      status: 'pending'
    });
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .populate('items.comboOffer')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product')
      .populate('items.comboOffer');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: 'Server error' });
  }
};