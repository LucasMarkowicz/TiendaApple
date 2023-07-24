const bcrypt = require('bcrypt');
const User = require('./models/user.Models.js');
const userErrors = require('../errors/userErrors.js');
const moment = require('moment');


class UserManager {
  async registerUser(userData) {
    try {
      const userExists = await User.findOne({ email: userData.email });

      if (userExists) {
        throw new Error(userErrors.USER_EXISTS);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = {
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'usuario',
      };

      const result = await User.create(newUser);

      return result;
    } catch (error) {
      console.error(`Error al registrar al usuario: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }

  async loginUser(email, password) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error(userErrors.USER_NOT_FOUND);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error(userErrors.INVALID_PASSWORD);
      }

      // Update the lastActive field to the current date and time.
      user.lastActive = moment();
      await user.save(); // Save the changes to the user document.

      return user;
    } catch (error) {
      console.error(`Error al iniciar sesión del usuario: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }

  async logoutUser(userId) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error(userErrors.USER_NOT_FOUND);
      }

      // Update the lastActive field to the current date and time.
      user.lastActive = moment();
      await user.save(); // Save the changes to the user document.

      return user;
    } catch (error) {
      console.error(`Error al hacer logout del usuario: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }

  async getUserRole(email) {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error(userErrors.USER_NOT_FOUND);
      }

      return user.role;
    } catch (error) {
      console.error(`Error al obtener el rol del usuario: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }

  async getAllUsers() {
    try {
      const users = await User.find({}, { email: 1, role: 1 });
      return users;
    } catch (error) {
      console.error(`Error al obtener todos los usuarios: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }

  async removeInactiveUsers(inactivePeriodInMinutes) {
    try {
      const inactiveThreshold = moment().subtract(inactivePeriodInMinutes, 'minutes');
      const deletedUsers = await User.find({ lastActive: { $lt: inactiveThreshold } });
      await User.deleteMany({ lastActive: { $lt: inactiveThreshold } });
      return deletedUsers;
    } catch (error) {
      console.error(`Error al eliminar usuarios inactivos: ${error}`);
      throw new Error(userErrors.GENERAL_ERROR);
    }
  }
  
}



module.exports = UserManager;
