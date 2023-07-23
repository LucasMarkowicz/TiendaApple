const productsControllers = require("../controllers/productsControllers.js")
const cartsControllers = require("../controllers/cartsControllers.js")
const userControllers = require("../controllers/userControllers.js")

function router(app) {
    app.use("/api/products", productsControllers)
    app.use("/api/carts", cartsControllers)
    app.use("/api/users", userControllers)

}

module.exports = router