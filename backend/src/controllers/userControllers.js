const { Router } = require("express");
const router = Router();
const UserManager = require('../daos/userManager.js');
const users = new UserManager();
const userErrors = require('../errors/userErrors.js');
const logger = require("../config/logger.js");
const accessRole = require("../middlewares/accessRole.js")
const { sendEmail } = require('../config/nodemailer.js'); // Import the email sending function



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

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const role = "user"; 

  try {
    await users.registerUser({ email, password, role });
    res.json({ success: true, message: 'Registro exitoso' });
  } catch (err) {
    logger.error(`Error en la ruta POST '/register': ${err}`);
    res.status(400).json({ success: false, error: userErrors.REGISTER_FAILED });
  }
});


router.post('/logout', accessRole(['admin', 'user']), async (req, res) => {
  try {
    const userId = req.session.user._id; 
    await users.logoutUser(userId);
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.json({ success: true, message: 'Cierre de sesión exitoso' });
    });
  } catch (error) {
    logger.error(`Error en la ruta POST '/logout': ${error}`);
    res.status(500).json({ success: false, error: userErrors.GENERAL_ERROR });
  }
});


router.get('/current', (req, res) => {
  if (req.session.user) {
    res.json({ isLoggedIn: true, user: req.session.user });
  } else {
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
    const deletedUsers = await users.removeInactiveUsers(3);
    console.log("Usuarios eliminados por inactividad:", deletedUsers);

    // Notify users via email
    const deletedUserEmails = deletedUsers.map(user => user.email);
    await sendIndividualEmailsToUsers(deletedUserEmails);

    res.json({ message: `Usuarios eliminados por inactividad` });
  } catch (error) {
    console.error("Error en la ruta DELETE '/users/inactive':", error);
    res.status(500).json({ message: userErrors.GENERAL_ERROR });
  }
});

async function sendIndividualEmailsToUsers(emails) {
  try {
    for (const email of emails) {
      // Assuming the sendEmail function can handle sending to a single recipient.
      await sendEmail(email);
    }
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
    throw new Error('Error al enviar el correo electrónico');
  }
}


module.exports = router;

