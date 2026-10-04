import React, { useState, useEffect } from 'react';
import Header from './Header';
import Catalog from './Catalog';
import Cart from './Cart';
import Admin from './Admin';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState('catalog');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    setUser(null);
    setPage('catalog');
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <Header 
        user={user} 
        cart={cart} 
        setPage={setPage} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onLogout={handleLogout} 
      />

      <main style={{ width: '100%' }}>
        {page === 'catalog' && <Catalog cart={cart} setCart={setCart} user={user} />}
        {page === 'cart' && user?.role !== 'Admin' && <Cart cart={cart} setCart={setCart} user={user} setPage={setPage} />}
        {page === 'admin' && user?.role === 'Admin' && <Admin />}
        {page === 'profile' && user && <Profile user={user} setUser={setUser} setPage={setPage} />}
        {page === 'login' && <Login onLogin={setUser} setPage={setPage} />}
        {page === 'register' && <Register onLogin={setUser} setPage={setPage} />}
      </main>
    </div>
  );
}

export default App;