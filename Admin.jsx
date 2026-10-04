import React, { useState, useEffect } from 'react';

function Admin() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  
  // Товары для редактирования скидок
  const [services, setServices] = useState([]);
  const [editingDiscounts, setEditingDiscounts] = useState({});

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    // Загрузка категорий
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Загрузка купонов
    fetch('http://localhost:5000/api/coupons')
      .then(res => res.json())
      .then(data => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => {});

    // Загрузка товаров для управления скидками
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        const initialMap = {};
        list.forEach(item => {
          initialMap[item.id] = item.discount_percent || 0;
        });
        setEditingDiscounts(initialMap);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  // Изменение скидки у товара
  const handleDiscountChange = (id, val) => {
    setEditingDiscounts(prev => ({
      ...prev,
      [id]: val
    }));
  };

  // Сохранение скидки товара на бэкенд
  const handleSaveDiscount = async (id) => {
    setErrorMsg(''); setSuccessMsg('');
    const discountVal = Number(editingDiscounts[id]);

    if (isNaN(discountVal) || discountVal < 0 || discountVal > 99) {
      return setErrorMsg('Скидка должна быть от 0% до 99%');
    }

    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}/discount`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_percent: discountVal })
      });

      if (!res.ok) throw new Error('Ошибка обновления скидки');
      setSuccessMsg('Скидка товара успешно обновлена!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Создание УНИКАЛЬНОЙ категории
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (!newCat.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCat.trim().toLowerCase())) {
      return setErrorMsg('Категория с таким названием уже существует!');
    }

    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat.trim() })
      });
      if (!res.ok) throw new Error('Ошибка создания категории');
      setNewCat('');
      setSuccessMsg('Категория добавлена!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Создание купона (макс 99%)
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    const disc = Number(newCouponDiscount);
    if (!newCouponCode || disc <= 0 || disc > 99) {
      return setErrorMsg('Скидка купона должна быть от 1% до 99%');
    }

    try {
      const res = await fetch('http://localhost:5000/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCouponCode.trim(), discount_percent: disc })
      });
      if (!res.ok) throw new Error('Ошибка создания купона');
      setNewCouponCode(''); setNewCouponDiscount('');
      setSuccessMsg('Купон создан!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Панель администратора</h2>

      {errorMsg && <div style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '6px', margin: '15px 0' }}>{errorMsg}</div>}
      {successMsg && <div style={{ border: '1px solid #10b981', color: '#10b981', padding: '10px', borderRadius: '6px', margin: '15px 0' }}>{successMsg}</div>}

      {/* Корректировка скидок товаров */}
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
        <h3>🏷️ Корректировка скидок у товаров</h3>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>Вы можете задавать и менять индивидуальную скидку товара от 0% до 99%</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
          {services.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-color)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: '35px', height: '35px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{Number(item.price).toFixed(2)} руб.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>Скидка (%):</span>
                <input 
                  type="number" 
                  min="0" 
                  max="99" 
                  value={editingDiscounts[item.id] !== undefined ? editingDiscounts[item.id] : ''} 
                  onChange={e => handleDiscountChange(item.id, e.target.value)} 
                  style={{ width: '70px', padding: '6px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)', textAlign: 'center' }} 
                />
                <button onClick={() => handleSaveDiscount(item.id)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                  Сохранить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Категории */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3>Уникальные категории</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input placeholder="Название категории" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1, padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
            <button type="submit" style={{ padding: '8px 15px' }}>Добавить</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(c => (
              <div key={c.id} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {c.name}
              </div>
            ))}
          </div>
        </div>

        {/* Купоны */}
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3>Скидочные купоны (макс 99%)</h3>
          <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0' }}>
            <input placeholder="Код купона" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} style={{ padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
            <input type="number" placeholder="Скидка % (1 - 99)" value={newCouponDiscount} onChange={e => setNewCouponDiscount(e.target.value)} style={{ padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
            <button type="submit" style={{ padding: '8px' }}>Создать купон</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coupons.map(cp => (
              <div key={cp.id} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <strong>{cp.code}</strong>
                <span style={{ color: '#10b981' }}>-{cp.discount_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;