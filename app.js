const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const expressValidator = require('express-validator');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors())

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);
app.use(expressValidator());


//Routes
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');


const api = process.env.API_URL;

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING,
    {
        dbName: 'innerdots_db'
    },
    (err, result) => {
        if (err) {
            console.log("Error in connecting with database")
        }
        else {
            console.log('Database connected')
        }
    });
//Server
app.listen(3000, () => {

    console.log('server is running http://localhost:3000');
})