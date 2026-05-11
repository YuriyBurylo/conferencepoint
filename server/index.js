require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const router = require('./routes/index');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({
  defCharset: 'utf8',
  defParamCharset: 'utf8'
}));
app.use('/api', router);


const start = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server started at port: ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
