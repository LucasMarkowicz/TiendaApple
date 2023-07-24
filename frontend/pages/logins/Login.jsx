import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shared.css';

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.tiendaappleimport.online/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error(error);
      setError('Error en el servidor');
    }
  };

  const handleRegister = () => {
    navigate('/register'); 
  };

  const handleGithubLogin = () => {
    window.location.href = 'https://api.tiendaappleimport.online/auth/github'; 
  };

  return (
    <div className="login-card">
      <h2>Iniciar sesión</h2>
      {error && <p>{error}</p>}
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
          className='control'
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className='control'
        />
        <button type="submit" className="control">Iniciar sesión</button>
      </form>
      <p>También puedes iniciar sesión con GitHub:</p>
      <button onClick={handleGithubLogin} className="control github-button">
        Iniciar sesión con GitHub
      </button>
      <p>No tienes cuenta? Puedes presionar el siguiente botón para registrarte:</p>
      <button onClick={handleRegister} className="register-button">Registrarse</button>
    </div>
  );
};

export default Login;

