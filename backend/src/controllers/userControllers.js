const { Router } = require("express");
const router = Router();
const UserManager = require('../daos/userManager.js');
const users = new UserManager();
const userErrors = require('../errors/userErrors.js');
const logger = require("../config/logger.js");
const accessRole = require("../middlewares/accessRole.js")


// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.loginUser(email, password);
    req.session.user = user;
    res.json({ success: true, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    logger.error(`Error en la ruta POST '/login': ${error}`);
    res.status(400).json({ success: false, error: userErrors.LOGIN_FAILED });
  }
});

// Ruta de registro
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const role = "user"; // Seteamos el rol directamente como "user"

  try {
    await users.registerUser({ email, password, role });
    res.json({ success: true, message: 'Registro exitoso' });
  } catch (err) {
    logger.error(`Error en la ruta POST '/register': ${err}`);
    res.status(400).json({ success: false, error: userErrors.REGISTER_FAILED });
  }
});

// Ruta de cierre de sesión
router.post('/logout', accessRole(['admin', 'user']), (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // Limpiar la cookie de sesión
    res.json({ success: true, message: 'Cierre de sesión exitoso' });
  });
});


router.get('/current', (req, res) => {
  if (req.session.user) {
    // El usuario ha iniciado sesión
    res.json({ isLoggedIn: true, user: req.session.user });
  } else {
    // El usuario no ha iniciado sesión
    res.json({ isLoggedIn: false });
  }
});

router.get("/", accessRole(['admin']), async (req, res) => {
  try {
    const allUsers = await users.getAllUsers();
    const simplifiedUsers = allUsers.map(user => {
      return {
        email: user.email,
        role: user.role,
      };
    });
    res.json(simplifiedUsers);
  } catch (error) {
    logger.error("Error en la ruta GET '/users':", error);
    res.status(500).json({ message: userErrors.GENERAL_ERROR });
  }
});

router.delete("/inactive", accessRole(['admin']), async (req, res) => {
  try {
    const deletedUsers = await users.removeInactiveUsers(10); // Eliminar usuarios inactivos de los últimos 30 minutos
    res.json({ message: `Usuarios eliminados por inactividad` });
  } catch (error) {
    logger.error("Error en la ruta DELETE '/users/inactive':", error);
    res.status(500).json({ message: userErrors.GENERAL_ERROR });
  }
});

module.exports = router;

