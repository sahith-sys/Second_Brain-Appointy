const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.json());

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});