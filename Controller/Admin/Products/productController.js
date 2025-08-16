const Product = require('../../../Models/Admin/Products/productModel');

const createProduct = async (req, res) => {
  try {
    const {
      name, description, mainCategory, category, subCategory,
      price, offerPrice, discountPercentage, measurment,
      weightsAndStocks, isPopular, isOfferProduct, isAvailable , isSeasonal
    } = req.body;

    const parsedWeightsAndStocks = JSON.parse(weightsAndStocks); 

    const images = req.files?.map(file => file.filename) || [];

    const product = new Product({
      name, description,
      mainCategory, category, subCategory,
      price, offerPrice, discountPercentage,
      measurment,
      weightsAndStocks: parsedWeightsAndStocks,
      images,
      isPopular, isOfferProduct, isAvailable , isSeasonal
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('mainCategory', 'name')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name, description, mainCategory, category, subCategory,
      price, offerPrice, discountPercentage, measurment,
      weightsAndStocks, isPopular, isOfferProduct, isAvailable , isSeasonal
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const parsedWeightsAndStocks = weightsAndStocks ? JSON.parse(weightsAndStocks) : product.weightsAndStocks;
    const images = req.files?.map(file => file.filename);

    product.name = name || product.name;
    product.description = description || product.description;
    product.mainCategory = mainCategory || product.mainCategory;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.price = price !== undefined ? price : product.price;
    product.offerPrice = offerPrice !== undefined ? offerPrice : product.offerPrice;
    product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
    product.measurment = measurment || product.measurment;
    product.weightsAndStocks = parsedWeightsAndStocks;
    if (images && images.length > 0) product.images = images;
    product.isPopular = isPopular !== undefined ? isPopular : product.isPopular;
    product.isOfferProduct = isOfferProduct !== undefined ? isOfferProduct : product.isOfferProduct;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
    product.isSeasonal = isSeasonal !== undefined ? isSeasonal : product.isSeasonal;

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const searchAndFilterProducts = async (req, res) => {
  try {
    const { search, stockFilter = 'all', priceFilter = 'all' } = req.query;

    const match = {};

    // ✅ Search filter
    if (search) {
      match.name = { $regex: search, $options: 'i' };
    }

    // ✅ Stock filter
    if (stockFilter && stockFilter !== 'all') {
      if (stockFilter === 'low') {
        match['weightsAndStocks.quantity'] = { $lte: 10 };
      } else if (stockFilter === 'medium') {
        match['weightsAndStocks.quantity'] = { $gt: 10, $lte: 25 };
      } else if (stockFilter === 'high') {
        match['weightsAndStocks.quantity'] = { $gt: 25 };
      }
    }

    // ✅ Aggregation for offerPrice vs price
    const pipeline = [
      { $match: match },
      {
        $addFields: {
          effectivePrice: {
            $cond: [
              { $ifNull: ["$offerPrice", false] },
              "$offerPrice",
              "$price"
            ]
          }
        }
      }
    ];

    // ✅ Price filter on effectivePrice
    if (priceFilter && priceFilter !== 'all') {
      let priceMatch = {};
      if (priceFilter === 'under50') {
        priceMatch = { effectivePrice: { $lt: 50 } };
      } else if (priceFilter === '50-100') {
        priceMatch = { effectivePrice: { $gte: 50, $lte: 100 } };
      } else if (priceFilter === '100-200') {
        priceMatch = { effectivePrice: { $gte: 100, $lte: 200 } };
      } else if (priceFilter === 'over200') {
        priceMatch = { effectivePrice: { $gt: 200 } };
      }
      pipeline.push({ $match: priceMatch });
    }

    // Run aggregation
    let products = await Product.aggregate(pipeline);

    // Populate category names (after aggregation)
    products = await Product.populate(products, [
      { path: "mainCategory", select: "name" },
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" }
    ]);

    res.json(products);
  } catch (err) {
    console.error('Error in searchAndFilterProducts:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchAndFilterProducts
};
