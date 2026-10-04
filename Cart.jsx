import React, { useState } from 'react';

function Cart({ cart, setCart, user, setPage }) {
  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [orderCreated, setOrderCreated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const applyCoupon = async () => {
    setCouponError('');
    if (!coupon) return;
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Неверный купон');
      setCouponDiscount(Math.min(data.discount_percent, 99)); // макс 99%
    } catch (err) {
      setCouponError(err.message);
      setCouponDiscount(0);
    }
  };

  // Расчет чека до и после скидок
  const rawTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalAfterProductDiscounts = cart.reduce((sum, item) => {
    const disc = item.discount_percent || 0;
    const price = disc > 0 ? item.price * (1 - disc / 100) : item.price;
    return sum + price * item.qty;
  }, 0);

  const totalDiscountPercent = Math.min((user?.personal_discount || 0) + couponDiscount, 99);
  const finalTotal = totalAfterProductDiscounts * (1 - totalDiscountPercent / 100);

  const handleCheckout = async () => {
    if (!address) return setErrorMsg('Укажите адрес доставки');
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          address,
          items: cart,
          totalPrice: finalTotal
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при создании заказа');
      }
      setCart([]);
      setOrderCreated(true);
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        setErrorMsg('Сервер бэкенда недоступен. Проверьте соединение.');
      } else {
        setErrorMsg(err.message);
      }
    }
  };

  if (orderCreated) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2 style={{ color: '#10b981' }}>🎉 Заказ успешно оформлен!</h2>
        <p>Вы можете просмотреть детали и историю в профиле.</p>
        <button onClick={() => setPage('catalog')} style={{ marginTop: '20px', padding: '10px 20px' }}>Вернуться в каталог</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Корзина</h2>
      {errorMsg && <div style={{ border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '6px', margin: '15px 0' }}>{errorMsg}</div>}

      {cart.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#888' }}>Ваша корзина пуста</p>
      ) : (
        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
          {/* Список товаров */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {/* Фото товара в корзине */}
                <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <h4>{item.name}</h4>
                  <div style={{ fontSize: '14px', color: '#888' }}>{Number(item.price).toFixed(2)} руб. / шт.</div>
                </div>
                {/* Кнопки + / - */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => changeQty(item.id, -1)} style={{ width: '28px', height: '28px' }}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} style={{ width: '28px', height: '28px' }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Чек и Оформление заказа */}
          <div style={{ width: '320px', backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
            <h3>Формирование чека</h3>
            <hr style={{ margin: '10px 0', borderColor: 'var(--border-color)' }} />
            
            <div style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Исходная цена:</span>
              <span style={{ textDecoration: 'line-through', color: '#888' }}>{rawTotal.toFixed(2)} руб.</span>
            </div>

            {totalDiscountPercent > 0 && (
              <div style={{ fontSize: '14px', color: '#10b981', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Скидка (купон/перс):</span>
                <span>-{totalDiscountPercent}%</span>
              </div>
            )}

            <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
              <span>Итого:</span>
              <span>{finalTotal.toFixed(2)} руб.</span>
            </div>

            {/* Ввод купона */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input placeholder="Промокод / Купон" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ padding: '8px', flex: 1, border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} />
                <button onClick={applyCoupon} style={{ padding: '8px 12px' }}>ОК</button>
              </div>
              {couponError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{couponError}</div>}
            </div>

            {/* Адрес доставки */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#888' }}>Адрес доставки:</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Введите адрес..." style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} />
            </div>

            <button onClick={handleCheckout} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>Оформить заказ</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;