const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');
const ComboCategory = require('../../../Models/Admin/ComboOffer/comboCategoryModel')



// Get All Combo Offers
exports.getAllComboOffers = async (req, res) => {
  try {
    const combos = await ComboOffer.find()
      .populate('category', 'title status')
      .populate('products.productId', 'name price weightsAndStocks images');

    const enhancedCombos = combos.map(combo => {
      let totalOriginalPrice = 0;
      
      const productsWithDetails = combo.products.map(p => {
        const product = p.productId;
        let weightPrice = null;
        let productImage = null;
        let productTotalPrice = 0;

        // Get weight-specific price if available
        if (product && product.weightsAndStocks) {
          const match = product.weightsAndStocks.find(
            ws => ws.weight === p.weight && ws.measurm === p.measurm
          );
          if (match) {
            weightPrice = match.weight_price;
            productTotalPrice = weightPrice * p.quantity;
            totalOriginalPrice += productTotalPrice;
          }
        } else if (product && product.price) {
          // Fallback to regular price if no weight-specific price
          productTotalPrice = product.price * p.quantity;
          totalOriginalPrice += productTotalPrice;
        }

        // Get first product image if available
        if (product && product.images && product.images.length > 0) {
          productImage = product.images[0];
        }

        return {
          ...p.toObject(),
          weightPrice,
          productTotalPrice,
          productImage,
          productName: product?.name || 'N/A'
        };
      });

      // Calculate discounted price
      let discountedPrice = totalOriginalPrice;
      if (combo.discountType === 'fixed') {
        discountedPrice = totalOriginalPrice - combo.discountValue;
      } else if (combo.discountType === 'percentage') {
        discountedPrice = totalOriginalPrice - (totalOriginalPrice * combo.discountValue / 100);
      }
      
      // Ensure discounted price doesn't go below 0
      discountedPrice = Math.max(0, discountedPrice);

      return {
        ...combo.toObject(),
        products: productsWithDetails,
        totalOriginalPrice,
        discountedPrice,
        totalSavings: totalOriginalPrice - discountedPrice
      };
    });

    res.status(200).json(enhancedCombos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Single Combo Offer with enhanced details
exports.getComboOfferById = async (req, res) => {
  try {
    const combo = await ComboOffer.findById(req.params.id)
      .populate('category', 'title status')
      .populate('products.productId', 'name price weightsAndStocks images');
    
    if (!combo) return res.status(404).json({ message: 'Combo offer not found' });
    
    let totalOriginalPrice = 0;
    
    const productsWithDetails = combo.products.map(p => {
      const product = p.productId;
      let weightPrice = null;
      let productImage = null;
      let productTotalPrice = 0;

      // Get weight-specific price if available
      if (product && product.weightsAndStocks) {
        const match = product.weightsAndStocks.find(
          ws => ws.weight === p.weight && ws.measurm === p.measurm
        );
        if (match) {
          weightPrice = match.weight_price;
          productTotalPrice = weightPrice * p.quantity;
          totalOriginalPrice += productTotalPrice;
        }
      } else if (product && product.price) {
        // Fallback to regular price if no weight-specific price
        productTotalPrice = product.price * p.quantity;
        totalOriginalPrice += productTotalPrice;
      }

      // Get first product image if available
      if (product && product.images && product.images.length > 0) {
        productImage = product.images[0];
      }

      return {
        ...p.toObject(),
        weightPrice,
        productTotalPrice,
        productImage,
        productName: product?.name || 'N/A'
      };
    });

    // Calculate discounted price
    let discountedPrice = totalOriginalPrice;
    if (combo.discountType === 'fixed') {
      discountedPrice = totalOriginalPrice - combo.discountValue;
    } else if (combo.discountType === 'percentage') {
      discountedPrice = totalOriginalPrice - (totalOriginalPrice * combo.discountValue / 100);
    }
    
    // Ensure discounted price doesn't go below 0
    discountedPrice = Math.max(0, discountedPrice);

    const enhancedCombo = {
      ...combo.toObject(),
      products: productsWithDetails,
      totalOriginalPrice,
      discountedPrice,
      totalSavings: totalOriginalPrice - discountedPrice
    };

    res.status(200).json(enhancedCombo);
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
        select: "name price weightsAndStocks images",
        match: { name: { $regex: q, $options: "i" } } 
      })
      .sort({ createdAt: -1 });

    const filtered = combos.filter(
      combo =>
        combo.name?.match(new RegExp(q, "i")) ||
        combo.products.some(p => p.productId) 
    );

    // Enhance the results with price calculations
    const enhancedResults = filtered.map(combo => {
      let totalOriginalPrice = 0;
      
      const productsWithDetails = combo.products.map(p => {
        const product = p.productId;
        let weightPrice = null;
        let productImage = null;
        let productTotalPrice = 0;

        if (product && product.weightsAndStocks) {
          const match = product.weightsAndStocks.find(
            ws => ws.weight === p.weight && ws.measurm === p.measurm
          );
          if (match) {
            weightPrice = match.weight_price;
            productTotalPrice = weightPrice * p.quantity;
            totalOriginalPrice += productTotalPrice;
          }
        } else if (product && product.price) {
          productTotalPrice = product.price * p.quantity;
          totalOriginalPrice += productTotalPrice;
        }

        if (product && product.images && product.images.length > 0) {
          productImage = product.images[0];
        }

        return {
          ...p.toObject(),
          weightPrice,
          productTotalPrice,
          productImage,
          productName: product?.name || 'N/A'
        };
      });

      let discountedPrice = totalOriginalPrice;
      if (combo.discountType === 'fixed') {
        discountedPrice = totalOriginalPrice - combo.discountValue;
      } else if (combo.discountType === 'percentage') {
        discountedPrice = totalOriginalPrice - (totalOriginalPrice * combo.discountValue / 100);
      }
      
      discountedPrice = Math.max(0, discountedPrice);

      return {
        ...combo.toObject(),
        products: productsWithDetails,
        totalOriginalPrice,
        discountedPrice,
        totalSavings: totalOriginalPrice - discountedPrice
      };
    });

    res.status(200).json({ success: true, results: enhancedResults });
  } catch (error) {
    console.error("Search Combo Offer Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};