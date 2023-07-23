const http = require("http");
const express = require("express");
const router = require("../src/routes/index.js");
const session = require("express-session");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8080;
const MongoStore = require("connect-mongo");
const passport = require("../src/config/passport.js");
const server = http.createServer(app);
const ProductManager = require("../src/daos/productManager.js");
const manager = new ProductManager();
const cors = require("cors");
const logger = require("../src/config/logger.js");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUiExpress = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const mercadopago = require("mercadopago");

const corsOptions = {
  origin: "https://tienda-apple-import-front.onrender.com/",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// Configuración de la sesión
const sessionOptions = {
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 120000,
  }),
  cookie: {
    sameSite: "none",  // Configurar el atributo SameSite en "None" para permitir solicitudes entre dominios
  },
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "https://tienda-apple-import-front.onrender.com/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("https://tienda-apple-import-front.onrender.com/");
  }
);

router(app);

//logger

app.get("/loggerTest", (req, res) => {
  logger.debug("Este es un mensaje de nivel debug de prueba");
  logger.http("Este es un mensaje de nivel http de prueba");
  logger.info("Este es un mensaje de nivel info de prueba");
  logger.warning("Este es un mensaje de nivel warning de prueba");
  logger.error("Este es un mensaje de nivel error de prueba");
  logger.fatal("Este es un mensaje de nivel fatal de prueba");
  res.send("Logs registrados en la consola de prueba");
});

//Swagger

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación del proyecto E-commerce",
      description: "Backend de una tienda utilizando Node.JS, Express y MongoDB",
    },
  },
  apis: [
    `${__dirname}/docs/Carts.yaml`,
    `${__dirname}/docs/Products.yaml`,
  ],
};

const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

//mercadopago

mercadopago.configure({
  access_token: process.env.MERCADOPAGO,
});

server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});



/*//faker y mocking
const { faker } = require("@faker-js/faker");
const generateFakeProducts = () => {
  const fakeProducts = [];

  for (let i = 0; i < 100; i++) {
    const categorias = ["iphones", "ipads", "macbooks", "airpods", "watches"];
    const randomIndex = Math.floor(Math.random() * categorias.length);
    const fakeProduct = {
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      price: faker.number.int(20000),
      thumbnail: faker.image.url(),
      code: faker.number.int(),
      stock: faker.number.int(100),
      category: categorias[randomIndex],
    };
    fakeProducts.push(fakeProduct);
  }

  return fakeProducts;
};

const fakeProducts = generateFakeProducts();

app.get("/mockingproducts", requireLogin, async (req, res) => {
  const { email, role } = req.session.user;
  console.log("soy req.session", req.session);
  console.log("soy req.session.user", req.session.user);
  try {
    const { limit = 4, page = 1, sort = "", query = "" } = req.query;

    const allProducts = await fakeProducts;

    const filteredProducts = query
      ? allProducts.filter((product) => product.category === query)
      : allProducts;

    const sortedProducts =
      sort === "desc"
        ? filteredProducts.sort((a, b) => b.price - a.price)
        : sort === "asc"
        ? filteredProducts.sort((a, b) => a.price - b.price)
        : filteredProducts;

    const totalPages = Math.ceil(sortedProducts.length / limit);

    const products = sortedProducts
      .slice((page - 1) * limit, page * limit)
      .map((product) => product);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const prevLink = hasPrevPage
      ? `/mockingproducts/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}`
      : null;
    const nextLink = hasNextPage
      ? `/mockingproducts/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}`
      : null;

    res.render("mocking", {
      status: "success",
      message: `Bienvenido, ${email}. Rol: ${role}`,
      products,
      totalPages,
      page: parseInt(page),
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la lista de productos");
  }
});

//websockets

io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.on("message", (message) => {
    const { type, payload } = JSON.parse(message);
    if (type === "addProduct") {
      const { title, description, price, thumbnail, code, stock, category } =
        payload;
      manager.addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category
      );
      const products = manager.getProducts();
      io.sockets.emit("addProduct", products);
    }
  });

  socket.on("deleteProduct", (data) => {
    const pid = data.id;
    const result = manager.deleteProduct(pid);
    if (result) {
      io.sockets.emit("deleteProduct", pid);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.get("/realtimeproducts", accessRole("admin"), async (req, res) => {
  const products = await manager.getProducts();
  res.render("realtimeproducts", { products });
});


*/