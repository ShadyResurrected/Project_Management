const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect('mongodb+srv://admin:admin@graphqlcluster.k3xi2.mongodb.net/?retryWrites=true&w=majority');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;