require("dotenv").config();
const express = require("express");
const CORS = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./routers/router");
const MONGODB_ATLES = process.env.MONGODB_ATLES_CONNECTION_URL;
const firstUrl = process.env.FIRST_LOCALHOST_ORIGIN_ACCESS;
const secondUrl = process.env.SECOND_NETLIFY_ORIGIN_ACCESS;

// creating my express app
const app = express();

// connecting to mongoose
mongoose.set("strictQuery", false);
mongoose
  .connect(MONGODB_ATLES, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongodb connected to your app!");
  })
  .catch((err) => {
    console.log(err);
  });

// necessay packages
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = `${secondUrl}, ${firstUrl}`;
app.use(
  CORS({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(router);

const port = process.env.PORT || 5600;

app.listen(port, () => {
  console.log(`Your app is running on port ${port}`);
});
