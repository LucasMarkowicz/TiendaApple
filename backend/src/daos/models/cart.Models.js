const mongoose = require('mongoose');
const cartCollection = 'cart';

const cartSchema = new mongoose.Schema({
  products: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product',
        },
        quantity: {
          type: Number,
          default: 1, 
        },
        subtotal: {
          type: Number,
          default: 0, 
        },
      }
    ],
    default: []
  },
  total: {
    type: Number,
    default: 0,
  }
});

cartSchema.methods.calculateSubtotals = function() {
  this.products.forEach((product) => {
    if (product.product && product.product.price) {
      product.subtotal = product.quantity * product.product.price;
    }
  });
  this.calculateTotal();
};

cartSchema.methods.calculateTotal = function() {
  this.total = this.products.reduce((total, product) => total + product.subtotal, 0);
};

const Cart = mongoose.model(cartCollection, cartSchema);
module.exports = Cart;
