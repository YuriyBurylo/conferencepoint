require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const router = require('./routes/index');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  origin: true, // разрешает любой origin, который прислал запрос
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);


app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));

