import React, { useState, useEffect } from 'react';

function Catalog({ cart, setCart, user }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);
  const [search, setSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');
    let url = `http://localhost:5000/api/services?search=${search}&code=${codeSearch}`;
    if (selectedCats.length > 0) url += `&categories=${selectedCats.join(',')}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера (${res.status})`);
        return res.json();
      })
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(err => {
        if (err.message.includes('Failed to fetch')) {
          setErrorMsg('Сервер бэкенда недоступен. Проверьте, запущен ли сервер на http://localhost:5000');
        } else {
          setErrorMsg(err.message);
        }
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, [search, codeSearch, selectedCats]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const changeQty = (item, delta) => {
    setCart(prev => {
      const exist = prev.find(x => x.id === item.id);
      if (!exist && delta > 0) return [...prev, { ...item, qty: 1 }];
      if (exist) {
        const newQty = exist.qty + delta;
        if (newQty <= 0) return prev.filter(x => x.id !== item.id);
        return prev.map(x => x.id === item.id ? { ...x, qty: newQty } : x);
      }
      return prev;
    });
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '30px', width: '100%', boxSizing: 'border-box' }}>
      {/* Боковая панель категорий (aside) */}
      <aside style={{ width: '220px', flexShrink: 0, backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Категории</h3>
        {categories.length === 0 ? <div style={{ fontSize: '13px', color: '#888' }}>Нет категорий</div> : (
          categories.map(cat => (
            <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input 
                type="checkbox" 
                onChange={(e) => {
                  if (e.target.checked) setSelectedCats([...selectedCats, cat.id]);
                  else setSelectedCats(selectedCats.filter(id => id !== cat.id));
                }} 
              /> {cat.name}
            </label>
          ))
        )}
      </aside>

      {/* Основная зона каталога */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input 
            placeholder="Поиск по названию..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ padding: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '6px', width: '100%', maxWidth: '300px' }} 
          />
          
          {user?.role === 'Admin' && (
            <input 
              placeholder="Поиск по коду..." 
              value={codeSearch} 
              onChange={e => setCodeSearch(e.target.value)} 
              style={{ padding: '10px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--accent-color)', color: 'var(--text-color)', borderRadius: '6px', width: '100%', maxWidth: '200px' }} 
            />
          )}
        </div>

        {/* Сообщение при упавшем бэкенде */}
        {errorMsg && (
          <div style={{ border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            ⚠️ <strong>Ошибка подключения:</strong> {errorMsg}
          </div>
        )}

        {loading ? (
          <div>Загрузка товаров и услуг...</div>
        ) : services.length === 0 && !errorMsg ? (
          <div style={{ padding: '20px', color: '#888' }}>По вашему запросу ничего не найдено.</div>
        ) : (
          /* Сетка СТРОГО на 5 карточек в ряд (на больших экранах) */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', width: '100%' }}>
            {services.map(item => {
              const discount = item.discount_percent || 0;
              const finalPrice = discount > 0 ? (item.price * (1 - discount / 100)).toFixed(2) : Number(item.price).toFixed(2);
              const cartItem = cart.find(x => x.id === item.id);
              const qty = cartItem ? cartItem.qty : 0;

              return (
                <div key={item.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  
                  <div style={{ width: '100%', height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', overflow: 'hidden' }}>
                    <img 
                      src={`http://localhost:5000${item.image_url}`} 
                      alt={item.name} 
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                  </div>

                  <h4 style={{ margin: '5px 0', fontSize: '14px', minHeight: '36px', display: 'flex', alignItems: 'center' }}>{item.name}</h4>
                  
                  <div style={{ margin: '6px 0' }}>
                    {discount > 0 ? (
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '11px', marginRight: '4px' }}>{Number(item.price).toFixed(2)} руб.</span>
                        <span style={{ color: '#10b981', fontSize: '15px', fontWeight: 'bold' }}>{finalPrice} руб.</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{Number(item.price).toFixed(2)} руб.</div>
                    )}
                  </div>

                  {user?.role !== 'Admin' && (
                    <div style={{ width: '100%', marginTop: 'auto' }}>
                      {qty === 0 ? (
                        <button onClick={() => changeQty(item, 1)} style={{ width: '100%', padding: '6px', fontSize: '13px' }}>В корзину</button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--border-color)', borderRadius: '6px', padding: '2px' }}>
                          <button onClick={() => changeQty(item, -1)} style={{ width: '28px', height: '28px' }}>−</button>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{qty}</span>
                          <button onClick={() => changeQty(item, 1)} style={{ width: '28px', height: '28px' }}>+</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalog;