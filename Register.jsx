import React, { useState } from 'react';

function Register({ onLogin, setPage }) {
  const [username, setUsername] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !login || !password) {
      return setError('Заполните все поля');
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, login, email: login, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');

      if (onLogin) onLogin(data.user);
      setPage('catalog');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', width: '100%' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '35px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Регистрация</h2>

        {error && <div style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#888', marginBottom: '5px', display: 'block' }}>Имя пользователя</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Введите ваше имя" 
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)' }} 
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888', marginBottom: '5px', display: 'block' }}>Email или Логин</label>
            <input 
              type="text" 
              value={login} 
              onChange={e => setLogin(e.target.value)}
              placeholder="Введите логин или email" 
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)' }} 
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888', marginBottom: '5px', display: 'block' }}>Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)' }} 
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '12px', fontWeight: '600', marginTop: '10px' }}>
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#888' }}>
          Зарегистрированы? <strong onClick={() => setPage('login')} style={{ color: 'var(--accent-color)', cursor: 'pointer' }}>Войти</strong>
        </div>
      </div>
    </div>
  );
}

export default Register;