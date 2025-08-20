const Checkout = require('../../../Models/User/Checkout/checkoutModel');
const Cart = require('../../../Models/User/Cart/cartModel');
const { getCoinProgress } = require ('../../../utils/coinProgress')
const User = require('../../../Models/User/Auth/authModel')

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

    const checkout = new Checkout({
      user: userId,
      cart: cartId
    });

    await checkout.save();
    res.status(201).json({ message: 'Checkout created', checkout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCheckout = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🧑 Fetch user with coinProgress
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

    // get latest checkout cart for progress
    const latestCart = checkout[0].cart;

    const coinProgress = await getCoinProgress(latestCart, user);

    res.status(200).json({
      checkout,
      coinProgress, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

