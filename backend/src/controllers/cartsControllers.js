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




// endpoints carrito

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
      res.json(cart); // Devuelve el carrito como respuesta en formato JSON
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
    const { quantity } = req.body; // Obtener la cantidad del cuerpo de la solicitud

    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity); // Pasar la cantidad a cartManager.addProductToCart
    updatedCart.calculateSubtotals(); // Calcular los subtotales y el total después de agregar el producto
    await updatedCart.save(); // Guardar los cambios en la base de datos
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
    updatedCart.calculateSubtotals(); // Calcular los subtotales después de eliminar el producto
    updatedCart.total = updatedCart.products.reduce((total, cartProduct) => total + cartProduct.subtotal, 0); // Recalcular el total sumando los subtotales de los productos restantes
    await updatedCart.save(); // Guardar los cambios en la base de datos
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
    updatedCart.calculateSubtotals(); // Calcular los subtotales y el total después de actualizar la cantidad
    await updatedCart.save(); // Guardar los cambios en la base de datos
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

    // Agregamos estas líneas para recalcular los subtotales y el total
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

    // Calcular subtotales antes de generar el ticket
    cart.calculateSubtotals();

    const code = Math.random().toString(36).substr(2, 10);
    const products = cart.toObject().products;
    const total = cart.total; // Obtener el total del carrito

    const ticket = new Ticket({ code, purchaser, products, total }); // Agregar el total al objeto del ticket
    await ticket.save();

    // Actualizar stock de los productos y guardar cambios
    for (const cartProduct of cart.products) {
      const product = await Product.findById(cartProduct.product._id);
      product.stock -= cartProduct.quantity;
      await product.save();
    }

    // Vaciar el carrito y guardar cambios
    cart.products = [];
    cart.calculateSubtotals();
    await cart.save();

    res.json({ message: "Compra realizada con éxito", ticket });
  } catch (error) {
    logger.error("Error en la ruta POST '/api/carts/:cid/purchase':", error);
    res.status(500).json({ error: cartErrors.PROCESSING_ERROR });
  }
});


// En la ruta /checkout
router.post("/checkout", async (req, res) => {
  try {
    // Obtiene los datos del carrito enviados desde el frontend
    const { cartId, total } = req.body;

    // Crea la preferencia de pago en MercadoPago
    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Compra en Tienda Apple Import", // Cambia el título según tus necesidades
          quantity: 1,
          unit_price: parseFloat(total),
        },
      ],
      external_reference: cartId, // Utiliza el cartId como referencia externa para identificar la compra en tu sistema
      back_urls: {
        success: "https://tiendaappleimport.online/success", // URL de éxito en tu frontend
        failure: "https://tiendaappleimport.online/failure", // URL de fallo en tu frontend
        pending: "https://tiendaappleimport.online/pending", // URL de pago pendiente en tu frontend
      },
      auto_return: "approved",
    });

    // Responde al frontend con el ID de la preferencia de pago
    res.json({ preferenceId: preference.body.id });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: "Error creating preference" });
  }
});

module.exports = router;
