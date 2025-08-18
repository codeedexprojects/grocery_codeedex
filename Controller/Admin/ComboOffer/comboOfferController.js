const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');
const ComboCategory = require('../../../Models/Admin/ComboOffer/comboCategoryModel')

// Create Combo Offer
exports.createComboOffer = async (req, res) => {
  try {
    const { category, ...offerData } = req.body;
    
    // Verify category exists
    const categoryExists = await ComboCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid combo category' });
    }

    // Handle image upload
    if (req.file) {
      offerData.image = req.file.path; 
    }

    const combo = new ComboOffer({
      ...offerData,
      category
    });
    
    await combo.save();
    
    // Populate category in response
    const populatedCombo = await ComboOffer.findById(combo._id)
      .populate('category', 'title')
      .populate('products.productId', 'name price weightsAndStocks');

    res.status(201).json({ 
      message: 'Combo offer created successfully', 
      combo: populatedCombo 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Combo Offers
exports.getAllComboOffers = async (req, res) => {
  try {
    const combos = await ComboOffer.find()
      .populate('category', 'title status')
      .populate('products.productId', 'name price weightsAndStocks images');

    const enhancedCombos = combos.map(combo => {
      const productsWithDetails = combo.products.map(p => {
        const product = p.productId;
        let weightPrice = null;
        let productImage = null;

        // Get weight-specific price if available
        if (product && product.weightsAndStocks) {
          const match = product.weightsAndStocks.find(
            ws => ws.weight === p.weight && ws.measurm === p.measurm
          );
          if (match) weightPrice = match.weight_price;
        }

        // Get first product image if available
        if (product && product.images && product.images.length > 0) {
          productImage = product.images[0];
        }

        return {
          ...p.toObject(),
          weightPrice,
          productImage,
          productName: product?.name || 'N/A'
        };
      });

      return {
        ...combo.toObject(),
        products: productsWithDetails
      };
    });

    res.status(200).json(enhancedCombos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Single Combo Offer
exports.getComboOfferById = async (req, res) => {
  try {
    const combo = await ComboOffer.findById(req.params.id).populate('products.productId', 'name price');
    if (!combo) return res.status(404).json({ message: 'Combo offer not found' });
    res.status(200).json(combo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Combo Offer
exports.updateComboOffer = async (req, res) => {
  try {
    const combo = await ComboOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combo) return res.status(404).json({ message: 'Combo offer not found' });
    res.status(200).json({ message: 'Combo offer updated successfully', combo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Combo Offer
exports.deleteComboOffer = async (req, res) => {
  try {
    const combo = await ComboOffer.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: 'Combo offer not found' });
    res.status(200).json({ message: 'Combo offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Search Combo Offers
exports.searchComboOffers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const combos = await ComboOffer.find({
      name: { $regex: q, $options: "i" } 
    })
      .populate({
        path: "products.productId",
        select: "name price weightsAndStocks",
        match: { name: { $regex: q, $options: "i" } } 
      })
      .sort({ createdAt: -1 });

    const filtered = combos.filter(
      combo =>
        combo.name?.match(new RegExp(q, "i")) ||
        combo.products.some(p => p.productId) 
    );

    res.status(200).json({ success: true, results: filtered });
  } catch (error) {
    console.error("Search Combo Offer Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
