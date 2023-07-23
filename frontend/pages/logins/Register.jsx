import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shared.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'user'; // Establecer el rol como 'user' por defecto
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        // Registro exitoso, redireccionar a la página de inicio de sesión
        navigate('/login');
      } else {
        // Mostrar mensaje de error en caso de registro fallido
        setError(data.error);
      }
    } catch (error) {
      // Manejar errores de red u otros errores imprevistos
      console.error(error);
      setError('Error en el servidor');
    }
  };

  const handleLogin = () => {
    navigate('/login'); // Redirige a la página de inicio de sesión
  };

  return (
    <div className="login-card">
      <h2>Registro</h2>
      {error && <p>{error}</p>}
      <form className="login-form" onSubmit={handleRegister}>
        <div className="username">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            autoComplete="off"
            spellCheck="false"
            className="control"
            required
          />
          <div id="spinner" className="spinner"></div>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          spellCheck="false"
          className="control"
          required
        />

        <button type="submit" className="control">
          Registrarse
        </button>
      </form>
      <p>¿Ya tienes una cuenta? Puedes iniciar sesión haciendo clic en el siguiente botón:</p>
      <button  onClick={handleLogin}>
        Iniciar sesión
      </button>
    </div>
  );
};

export default Register;
