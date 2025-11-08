const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const itemsRouter = require('./routes/items');
require('dotenv').config();

const app = express();

app.use(express.json());

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/items", itemsRouter);



app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});