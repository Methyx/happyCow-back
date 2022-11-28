const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

app.use(require("./routes/restaurants"));
app.use(require("./routes/user"));

app.all("*", (req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Phil, server is started 🚘");
});
