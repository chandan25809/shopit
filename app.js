const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const errorMiddleware=require('./middlewares/erros')
const bodyparser = require('body-parser');
// Setting up config file 
if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'backend/config/config.env' })
// dotenv.config({ path: 'backend/config/config.env' })
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(cookieParser())
app.use(express.json());
const products = require('./routes/product');
const auth = require('./routes/auth');
const orders = require('./routes/order');

app.use(errorMiddleware);
app.use('/api/v1',products)
app.use('/api/v1',auth)
app.use('/api/v1',orders)
module.exports=app;