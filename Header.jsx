import React from 'react';

function Header({ user, cart = [], setPage, theme, toggleTheme, onLogout }) {
  const totalCartCount = Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.qty || 0), 0) : 0;

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '15px 30px', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
      <button onClick={() => setPage('catalog')} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
        Каталог
      </button>

      {user?.role !== 'Admin' && (
        <button onClick={() => setPage('cart')} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
          Корзина ({totalCartCount})
        </button>
      )}

      {user?.role === 'Admin' && (
        <button onClick={() => setPage('admin')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
          ⚡ Админ-панель
        </button>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button onClick={toggleTheme} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
          Переключить тему ({theme})
        </button>

        {user ? (
          <>
            <button onClick={() => setPage('profile')} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
              👤 {user.username || user.login} {user.role === 'Admin' && '(Админ)'}
            </button>
            <button onClick={onLogout} style={{ background: 'var(--border-color)', color: 'var(--text-color)', padding: '8px 16px', cursor: 'pointer' }}>Выйти</button>
          </>
        ) : (
          /* Кнопка с классом btn-auth для увеличения размера */
          <button className="btn-auth" onClick={() => setPage('login')}>
            Войти / Регистрация
          </button>
        )}
      </div>
    </nav>
  );
}

export default Header;