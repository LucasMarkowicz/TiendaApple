const { Router } = require("express");
const router = Router();
const CartManager = require("../daos/cartManager.js");
const ProductManager = require("../daos/productManager.js");
const cartManager = new CartManager();
const productManager = new ProductManager();
const { cartVerification } = require("../middlewares/cartVerification.js");
const checkCartOwnership = require("../middlewares/checkCartOwnership.js");
const Ticket = require("../daos/models/ticket.Models.js");
const Cart = require("../daos/models/cart.Models");
const User = require("../daos/models/user.Models");
const Product = require("../daos/models/product.Models");
const accessRole = require("../middlewares/accessRole");
const cartErrors = require("../errors/cartErrors.js");
const userErrors = require("../errors/userErrors.js");
const logger = require("../config/logger.js");
const mercadopago = require("mercadopago");





router.post("/", cartVerification, accessRole(['admin', 'user']), async (req, res) => {
  try {
    const cartId = req.session.user.associatedCart._id;
    logger.info(`ID del carrito: ${cartId}`);
    res.status(200).json({
      cartId,
    });
  } catch (error) {
    logger.error("Error en la ruta POST 'api/products/':", error);
    res.status(500).json({ message: cartErrors.GENERAL_ERROR });
  }
});




router.get("/:cid", accessRole(['admin', 'user']), async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.getCart(cid);
    if (cart) {
      res.json(cart); 
    } else {
      res.status(404).json({ error: cartErrors.CART_NOT_FOUND });
    }
  } catch (error) {
    logger.error("Error en la ruta GET 'api/carts/:cid/':", error);
    res.status(500).json({ error: cartErrors.GENERAL_ERROR });
  }
});




router.post("/:cid/products/:pid", checkCartOwnership, accessRole(['admin', 'user']), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; 

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity); 
    updatedCart.calculateSubtotals(); 
    await updatedCart.save(); 
    res.send(updatedCart);
  } catch (error) {
    logger.error("Error en la ruta POST 'api/carts/:cid/products/:pid':", error);
    res.status(500).json({ message: cartErrors.GENERAL_ERROR });
  }
});


router.delete("/:cid/products/:pid", checkCartOwnership, accessRole(['admin', 'user']), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    updatedCart.calculateSubtotals(); 
    updatedCart.total = updatedCart.products.reduce((total, cartProduct) => total + cartProduct.subtotal, 0); 
    await updatedCart.save(); 
    res.json(updatedCart);
  } catch (error) {
    logger.error("Error en la ruta DELETE 'api/carts/:cid/products/:pid':", error);
    res.status(500).json({ message: cartErrors.GENERAL_ERROR });
  }
});


router.put("/:cid/products/:pid", accessRole(['admin', 'user']), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
    updatedCart.calculateSubtotals(); 
    await updatedCart.save(); 
    res.json(updatedCart);
  } catch (error) {
    logger.error("Error en la ruta PUT 'api/carts/:cid/products/:pid':", error);
    res.status(500).json({ message: cartErrors.GENERAL_ERROR });
  }
});



router.delete("/:cid", checkCartOwnership, accessRole(['admin', 'user']), async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartManager.clearCart(cid);

    
    cart.calculateSubtotals();
    await cart.save();

    res.json(cart);
  } catch (error) {
    logger.error("Error en la ruta DELETE 'api/carts/:cid':", error);
    res.status(500).json({ message: cartErrors.GENERAL_ERROR });
  }
});



router.post("/:cid/purchase", checkCartOwnership, accessRole("user"), async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
      logger.info(`Carrito no encontrado: ${cid}`);
      return res.status(404).json({ error: cartErrors.CART_NOT_FOUND });
    }

    const user = await User.findOne({ associatedCart: String(cid) });
    if (!user) {
      logger.info(`Usuario no encontrado para el carrito: ${cid}`);
      return res.status(404).json({ error: userErrors.USER_NOT_FOUND });
    }

    const purchaser = user.email;

    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.product._id);
      if (!product || product.stock < cartProduct.quantity) {
        logger.info(`Producto no encontrado o cantidad insuficiente en el carrito: ${cid}`);
        return res.status(400).json({ error: cartErrors.INSUFFICIENT_STOCK });
      }
    }

   
    cart.calculateSubtotals();

    const code = Math.random().toString(36).substr(2, 10);
    const products = cart.toObject().products;
    const total = cart.total; 

    const ticket = new Ticket({ code, purchaser, products, total }); 
    await ticket.save();


    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.product._id);
      product.stock -= cartProduct.quantity;
      await product.save();
    }

  
    cart.products = [];
    cart.calculateSubtotals();
    await cart.save();

    res.json({ message: "Compra realizada con éxito", ticket });
  } catch (error) {
    logger.error("Error en la ruta POST '/api/carts/:cid/purchase':", error);
    res.status(500).json({ error: cartErrors.PROCESSING_ERROR });
  }
});



router.post("/checkout", async (req, res) => {
  try {
    
    const { cartId, total } = req.body;

   
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Compra en Tienda Apple Import", 
          quantity: 1,
          unit_price: parseFloat(total),
        },
      ],
      external_reference: cartId, 
      back_urls: {
        success: "https://tiendaappleimport.online/success", 
        failure: "https://tiendaappleimport.online/failure", 
        pending: "https://tiendaappleimport.online/pending", 
      },
      auto_return: "approved",
    });

    res.json({ preferenceId: preference.body.id });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: "Error creating preference" });
  }
});

module.exports = router;
