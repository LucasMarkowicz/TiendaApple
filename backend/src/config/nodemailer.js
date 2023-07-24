const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const dotenv = require("dotenv");
dotenv.config();

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Crear el generador de contenido de correo electrónico utilizando Mailgen
const mailGenerator = new Mailgen({
  theme: 'default', // Puedes usar 'default' o 'salted'
  product: {
    // Nombre de tu producto o aplicación
    name: 'Tienda Apple Import',
    link: 'https://www.tiendaappleimport.com', // URL de tu sitio web
  },
});

async function sendEmail(userEmail) {
  try {
    // Crear el contenido del correo electrónico utilizando Mailgen
    const email = {
      body: {
        name: userEmail, // Nombre del usuario (puedes personalizar esto)
        intro: 'Your account has been deleted due to inactivity.',
        outro: 'For any questions, please do not hesitate to contact us', // Información adicional o despedida
      },
    };

    // Generar el HTML del correo electrónico
    const emailBody = mailGenerator.generate(email);

    // Configurar el correo electrónico
    const mailOptions = {
      from: 'luckpelle20@gmail.com',
      to: userEmail,
      subject: 'Account Deletion Notification',
      html: emailBody,
    };

    // Enviar el correo electrónico
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  transporter,
  sendEmail,
};