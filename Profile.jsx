import React, { useState, useEffect } from 'react';

function Profile({ user, setUser }) {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/orders/user/${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка обновления');

      setUser({ ...user, username, address });
      setMessage('Данные успешно сохранены!');
      setPassword('');
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setErrorMsg('Сервер бэкенда недоступен. Ошибка сервера.');
      } else {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 15px', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '650px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '30px', borderRadius: '16px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Личный кабинет</h2>

        {message && <div style={{ color: '#10b981', textAlign: 'center', marginBottom: '15px' }}>{message}</div>}
        {errorMsg && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{errorMsg}</div>}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#888' }}>Имя пользователя / Логин</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888' }}>Новый пароль (оставьте пустым, если не меняете)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#888' }}>Основной адрес доставки</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Улица, дом, квартира..." style={{ width: '100%', padding: '10px', marginTop: '4px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
          </div>

          <button type="submit" style={{ padding: '12px', fontWeight: 'bold', marginTop: '10px' }}>Сохранить профиль</button>
        </form>

        <hr style={{ margin: '30px 0', borderColor: 'var(--border-color)' }} />

        <h3>История заказов</h3>
        {orders.length === 0 ? (
          <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>У вас пока нет заказов</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            {orders.map(ord => (
              <div key={ord.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Заказ №{ord.id}</span>
                  <span style={{ color: '#10b981' }}>{Number(ord.total_price).toFixed(2)} руб.</span>
                </div>
                <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>Адрес: {ord.address}</div>
                <div style={{ marginTop: '8px', fontSize: '13px' }}>
                  <strong>Товары:</strong> {ord.items_summary || `Количество: ${ord.total_qty || 1} шт.`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;