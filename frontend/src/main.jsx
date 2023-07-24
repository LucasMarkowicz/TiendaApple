import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { HashRouter } from 'react-router-dom'; // Import HashRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter> {/* Use HashRouter instead of BrowserRouter */}
    <App />
  </HashRouter>
);
