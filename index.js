require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json({ limit: "500mb" }));  
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const adminAuthRoutes = require('./Routes/Admin/Auth/authRoutes')
const adminMainCategoryRoutes = require('./Routes/Admin/MainCategories/mainCategoryRoutes');
const adminCategoryRoutes=require('./Routes/Admin/Category/categoryRoutes')
const adminsubCategoryRoutes=require('./Routes/Admin/SubCategory/subCategoryRoutes')
const adminProductRoutes=require('./Routes/Admin/Products/productRoutes')
const adminCarousalRoutes=require('./Routes/Admin/Carousal/carousalRoutes')
const adminTimeSaleRoutes=require('./Routes/Admin/TimeSale/timeSaleRoutes')

const userAuthRoutes=require('./Routes/User/Auth/authRoutes')
const userProductRoutes = require('./Routes/User/Products/productRoutes')
const userMainCategoryRoutes=require('./Routes/User/MainCategory/mainCategoryRoutes')


app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/main-category', adminMainCategoryRoutes);
app.use('/api/admin/category', adminCategoryRoutes)
app.use('/api/admin/subcategory',adminsubCategoryRoutes)
app.use('/api/admin/product', adminProductRoutes)
app.use('/api/admin/carousal',adminCarousalRoutes)
app.use('/api/admin/time-sale',adminTimeSaleRoutes)


app.use('/api/user/auth',userAuthRoutes)
app.use('/api/user/product',userProductRoutes)
app.use('/api/user/main-category',userMainCategoryRoutes)


require('./DB/connection');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Server Configuration
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server started listening at PORT ${PORT}`);
});
