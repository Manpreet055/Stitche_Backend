require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const helmet = require("helmet");
const connectMongoDB = require("./config/connectMongoDB");
const handleSearch = require("./controllers/coreControllers/handleSearchController");
const handleGetstats = require("./controllers/coreControllers/statsController");
const apiLimiter = require("./middlewares/rateLimit");
const port = process.env.PORT || 3000;

connectMongoDB();

const orders = require("./routes/ordersRoute");
const users = require("./routes/usersRoute");
const inbox = require("./routes/inboxRoute");
const products = require("./routes/productsRoute");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use("/api/", apiLimiter);

app.use("/api/users", users);
app.use("/api/orders", orders);
app.use("/api/inbox", inbox);
app.use("/api/products", products);
app.use("/api/search", handleSearch);
app.use("/api/stats", handleGetstats);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
