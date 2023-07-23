const User = require("../daos/models/user.Models.js");
const CartManager = require("../daos/cartManager.js");
const cartM = new CartManager();
const logger = require('../config/logger.js')

async function cartVerification(req, res, next){
    const { email } = req.session.user;

    if (!req.session.user.hasOwnProperty("associatedCart") || req.session.user.associatedCart === null) {
        // If user has no associated cart, create a new one
        const cartCreated = await cartM.createCart();
        req.session.user.associatedCart = cartCreated;
        logger.info(`req.session.user.associatedCart._id: ${JSON.stringify(req.session.user.associatedCart._id, null, 2)}`);
        logger.info(`cartCreated: ${JSON.stringify(cartCreated, null, 2)}`);
        await User.findOneAndUpdate({ email }, { associatedCart: cartCreated.id }, { new: true });
    } else {
        // If user has an associated cart, check if it exists in the "carts" collection
        try {
            const existingCart = await cartM.getCart(req.session.user.associatedCart);
            if (!existingCart) {
                // If the cart doesn't exist, create a new one and update the user's associatedCart
                const newCart = await cartM.createCart();
                req.session.user.associatedCart = newCart;
                logger.info(`req.session.user.associatedCart._id: ${JSON.stringify(req.session.user.associatedCart._id, null, 2)}`);
                logger.info(`newCart: ${JSON.stringify(newCart, null, 2)}`);
                await User.findOneAndUpdate({ email }, { associatedCart: newCart.id }, { new: true });
            }
        } catch (error) {
            // If there was an error while fetching the cart, create a new one and update the user's associatedCart
            const newCart = await cartM.createCart();
            req.session.user.associatedCart = newCart;
            logger.info(`req.session.user.associatedCart._id: ${JSON.stringify(req.session.user.associatedCart._id, null, 2)}`);
            logger.info(`newCart: ${JSON.stringify(newCart, null, 2)}`);
            await User.findOneAndUpdate({ email }, { associatedCart: newCart.id }, { new: true });
        }
    }
    next();
}

module.exports = { cartVerification };
