import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Shared.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'user'; 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.tiendaappleimport.online/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/login');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error(error);
      setError('Error en el servidor');
    }
  };

  const handleLogin = () => {
    navigate('/login'); 
  };

  return (
    <div className="login-card">
      <h2>Register</h2>
      {error && <p>{error}</p>}
      <form className="login-form" onSubmit={handleRegister}>
        <div className="username">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
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
          placeholder="Password"
          spellCheck="false"
          className="control"
          required
        />

        <button type="submit" className="control">
          Sign Up
        </button>
      </form>
      <p>Do you already have an account? You can log in by clicking the following button:</p>
      <button  onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Register;
