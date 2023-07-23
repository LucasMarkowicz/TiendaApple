const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: {type:Number, unique: true},
    stock: Number,
    category: String,
})

const Product = mongoose.model("product", productSchema)
module.exports = Product

