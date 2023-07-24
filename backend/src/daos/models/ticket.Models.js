const mongoose = require('mongoose');

const ticketProductSchema = new mongoose.Schema({
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
});

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,
  },
  purchaser: {
    type: String,
    required: true,
  },
  products: {
    type: [ticketProductSchema], 
    required: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  paymentReference: {
    type: String,
    unique: true,
  },
});

const Ticket = mongoose.model('ticket', ticketSchema);

module.exports = Ticket;
