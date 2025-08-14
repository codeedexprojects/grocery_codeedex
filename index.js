require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const adminAuthRoutes = require('./Routes/Admin/Auth/authRoutes');
const adminMainCategoryRoutes = require('./Routes/Admin/MainCategories/mainCategoryRoutes');
const adminCategoryRoutes = require('./Routes/Admin/Category/categoryRoutes');
const adminsubCategoryRoutes = require('./Routes/Admin/SubCategory/subCategoryRoutes');
const adminProductRoutes = require('./Routes/Admin/Products/productRoutes');
const adminCarouselRoutes = require('./Routes/Admin/Carousel/carouselRoutes');
const adminTimeSaleRoutes = require('./Routes/Admin/TimeSale/timeSaleRoutes');
const adminHomeGifRoutes = require('./Routes/Admin/Carousel/homeGifRoutes');
const adminUserManagementRoutes = require('./Routes/Admin/UserManagement/userManagementRoutes');
const adminCoinSettingsRoutes = require('./Routes/Admin/CoinSetting/CoinSettingRoute');
const adminSubAdminManagement = require('./Routes/Admin/SubAdminManagement/subAdminManagementRoute');
const adminCouponRoutes = require('./Routes/Admin/Coupon/couponRoutes')
const adminActivityLogRoutes = require('./Routes/Admin/ActivityLog/activityLogRoute')



const userAuthRoutes = require('./Routes/User/Auth/authRoutes');
const userProductRoutes = require('./Routes/User/Products/productRoutes');
const userMainCategoryRoutes = require('./Routes/User/MainCategory/mainCategoryRoutes');
const userHomeGifRoutes = require('./Routes/User/Carousel/homeGifRoutes');
const userCarouselRoutes = require('./Routes/User/Carousel/carouselRoutes');
const userWishlistRoutes = require('./Routes/User/Wishlist/wishlistRoutes');
const userProfileRoutes = require('./Routes/User/Profile/profileRoute');
const userCartRoutes= require('./Routes/User/Cart/cartRoutes')
const userCategoryRoutes = require('./Routes/User/Category/categoryRoutes')


app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/main-category', adminMainCategoryRoutes);
app.use('/api/admin/category', adminCategoryRoutes);
app.use('/api/admin/subcategory', adminsubCategoryRoutes);
app.use('/api/admin/product', adminProductRoutes);
app.use('/api/admin/carousel', adminCarouselRoutes);
app.use('/api/admin/time-sale', adminTimeSaleRoutes);
app.use('/api/admin/home-gif', adminHomeGifRoutes);
app.use('/api/admin/user-management', adminUserManagementRoutes);
app.use('/api/admin/coin-setting', adminCoinSettingsRoutes);
app.use('/api/admin/sub-admin-management', adminSubAdminManagement)
app.use('/api/admin/coupon', adminCouponRoutes)
app.use('/api/admin/activity-log', adminActivityLogRoutes)



app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/product', userProductRoutes);
app.use('/api/user/main-category', userMainCategoryRoutes);
app.use('/api/user/home-gif', userHomeGifRoutes);
app.use('/api/user/carousel', userCarouselRoutes);
app.use('/api/user/wishlist', userWishlistRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/cart', userCartRoutes)
app.use('/api/user/category',userCategoryRoutes)

require('./DB/connection');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server started listening at PORT ${PORT}`);
});
