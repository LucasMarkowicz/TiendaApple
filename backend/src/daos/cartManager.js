const { ObjectId } = require("../db/db.js");
const Cart = require("./models/cart.Models.js");
const ProductManager = require("./productManager.js");
const productDao = new ProductManager();
const cartErrors = require("../errors/cartErrors.js");
const logger = require("../config/logger.js");

class CartManager {
  async createCart() {
    try {
      const cart = await Cart.create({ products: [] });
      return cart;
    } catch (error) {
      logger.error(`Error al crear el carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async getCart(cid) {
    try {
      const cart = await Cart.findById(cid).populate({
        path: "products.product",
        select: "title description price thumbnail code stock category",
        options: { lean: true },
      });
      return cart;
    } catch (error) {
      logger.error(`Error al obtener el carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async getFirstCart() {
    try {
      const carts = await getCartCollection();
      return await carts.findOne();
    } catch (error) {
      logger.error(`Error al obtener el primer carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async addProductToCart(cid, pid, quantity) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(cartErrors.CART_NOT_FOUND);
      }
  
      const product = await productDao.getProductById(pid);
      if (!product) {
        throw new Error(cartErrors.PRODUCT_NOT_FOUND);
      }
  
      const productStock = product.stock;
  
      if (productStock === 0) {
        throw new Error(cartErrors.OUT_OF_STOCK);
      }
  
      const productIndex = cart.products.findIndex((e) => e.product.toString() === pid);
  
      if (productIndex !== -1) {
        const cartProduct = cart.products[productIndex];
        const productQuantity = cartProduct.quantity;
  
        if (productQuantity + quantity > productStock) {
          throw new Error(cartErrors.QUANTITY_EXCEEDS_STOCK);
        } else {
          await Cart.updateOne(
            { _id: cid, "products.product": pid },
            { $inc: { "products.$.quantity": quantity } }
          );
        }
      } else {
        await Cart.updateOne(
          { _id: cid },
          {
            $push: {
              products: {
                product: product._id,
                quantity,
              },
            },
          }
        );
      }
  
      const updatedCart = await Cart.findById(cid).populate("products.product");
      return updatedCart;
    } catch (error) {
      logger.error(`Error al agregar producto al carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async removeProductFromCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(cartErrors.CART_NOT_FOUND);
      }

      const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === pid
      );

      if (productIndex === -1) {
        throw new Error(cartErrors.PRODUCT_NOT_FOUND);
      }

      cart.products.splice(productIndex, 1);
      await cart.save();

      return cart;
    } catch (error) {
      logger.error(`Error al remover producto del carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(cartErrors.CART_NOT_FOUND);
      }

      await Cart.updateOne(
        { _id: cid, "products.product": pid },
        { $set: { "products.$.quantity": quantity } }
      );

      const updatedCart = await Cart.findById(cid);
      return updatedCart;
    } catch (error) {
      logger.error(`Error al actualizar la cantidad del producto en el carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async updateProductsInCart(cid, productsToUpdate) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(cartErrors.CART_NOT_FOUND);
      }

      for (const product of productsToUpdate) {
        const { _id, quantity } = product;

        const productInCartIndex = cart.products.findIndex(
          (p) => p.product._id.toString() === _id
        );

        if (productInCartIndex !== -1) {
          // Si el producto ya existe en el carrito, actualizar la cantidad
          cart.products[productInCartIndex].quantity = quantity;
        } else {
          // Si el producto no existe en el carrito, agregarlo
          const productToAdd = await productDao.getProductById(_id);
          if (!productToAdd) {
            throw new Error(cartErrors.PRODUCT_NOT_FOUND);
          }

          cart.products.push({
            product: productToAdd._id,
            quantity,
          });
        }
      }

      return cart;
    } catch (error) {
      logger.error(`Error al actualizar los productos en el carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }

  async clearCart(cid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) {
        throw new Error(cartErrors.CART_NOT_FOUND);
      }

      cart.products.splice(0, cart.products.length);
      await cart.save();

      return cart;
    } catch (error) {
      logger.error(`Error al limpiar el carrito: ${error}`);
      throw new Error(cartErrors.GENERAL_ERROR);
    }
  }
}

module.exports = CartManager;
