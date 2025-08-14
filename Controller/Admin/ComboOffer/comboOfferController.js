const ComboOffer = require('../../../Models/Admin/ComboOffer/comboOfferModel');

// Create Combo Offer
exports.createComboOffer = async (req, res) => {
  try {
    const combo = new ComboOffer(req.body);
    await combo.save();
    res.status(201).json({ message: 'Combo offer created successfully', combo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Combo Offers
exports.getAllComboOffers = async (req, res) => {
  try {
    const combos = await ComboOffer.find()
      .populate('products.productId', 'name price weightsAndStocks');

    
    const combosWithWeightPrice = combos.map(combo => {
      const updatedProducts = combo.products.map(p => {
        let weightPrice = null;

        if (p.productId && p.productId.weightsAndStocks) {
          const match = p.productId.weightsAndStocks.find(
            ws => ws.weight === p.weight && ws.measurm === p.measurm
          );
          if (match) {
            weightPrice = match.weight_price;
          }
        }

        return {
          ...p.toObject(),
          weight_price: weightPrice 
        };
      });

      return {
        ...combo.toObject(),
        products: updatedProducts
      };
    });

    res.status(200).json(combosWithWeightPrice);
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
