const express = require("express");
require('dotenv').config();
const {graphqlHTTP} = require('express-graphql');
const schema = require('./schema/schema')
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db')

// first it will read it from the enviorment variable and if not found then it will set port as 5000
const port = process.env.PORT || 5000;

const app = express();

// Connect to Database
connectDB();

app.use(cors());

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql : process.env.NODE_ENV === 'development'
}))

app.listen(port,console.log(`Server running on port ${port}`));