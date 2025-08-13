const Cart = require('../../../Models/User/Cart/cartModel');
const Product = require('../../../Models/Admin/Products/productModel');

exports.addToCart = async (req, res) => {
  try {
    const { productId, weight, measurm, quantity } = req.body;
    const userId = req.user._id; 

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    let price = product.price;
    if (weight) {
      const weightStock = product.weightsAndStocks.find(w => w.weight === weight && w.measurm === measurm);
      if (weightStock) price = weightStock.weight_price;
    }
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, weight, measurm, quantity, price }],
        totalPrice: price * quantity
      });
    } else {
      const existingItem = cart.items.find(
        item => item.product.toString() === productId &&
                item.weight === weight &&
                item.measurm === measurm
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, weight, measurm, quantity, price });
      }

      cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error(err);
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
