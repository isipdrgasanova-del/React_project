import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'store_db',
  password: '12345678',
  port: 5432,
});

// Авторизация
app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const userRes = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1 OR u.username = $1`,
      [login ? login.trim() : '']
    );

    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const user = userRes.rows[0];
    let isMatch = user.password_hash === password || await bcrypt.compare(password, user.password_hash).catch(() => false);

    if (!isMatch) return res.status(401).json({ error: 'Неверный логин или пароль' });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address,
        role: user.role_name,
        personalDiscount: Math.min(user.personal_discount_percent || 0, 99)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера БД' });
  }
});

// Смена логина и пароля
app.patch('/api/users/:id/credentials', async (req, res) => {
  const { id } = req.params;
  const { newUsername, newPassword } = req.body;
  try {
    if (newUsername) {
      await pool.query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, id]);
    }
    if (newPassword) {
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPassword, id]);
    }
    res.json({ message: 'Данные обновлены' });
  } catch (err) {
    res.status(400).json({ error: 'Логин уже занят или произошла ошибка' });
  }
});

// Управление товарами и скидками
app.get('/api/services', async (req, res) => {
  const { search, code, categories } = req.query;
  try {
    let query = `SELECT s.*, c.name as category_name FROM services s LEFT JOIN categories c ON s.category_id = c.id WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.name ILIKE $${params.length} OR s.description ILIKE $${params.length})`;
    }
    if (code) {
      params.push(`%${code}%`);
      query += ` AND s.code ILIKE $${params.length}`;
    }
    if (categories) {
      const catList = categories.split(',').map(Number);
      params.push(catList);
      query += ` AND s.category_id = ANY($${params.length})`;
    }

    query += ` ORDER BY s.id ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Сервер недоступен (Database Error)' });
  }
});

app.patch('/api/services/:id/discount', async (req, res) => {
  const { id } = req.params;
  const { discount_percent } = req.body;
  const has_discount = discount_percent > 0;
  try {
    await pool.query('UPDATE services SET discount_percent = $1, has_discount = $2 WHERE id = $3', [discount_percent, has_discount, id]);
    res.json({ message: 'Скидка обновлена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления скидки' });
  }
});

// Категории с обязательной уникальностью
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Сервер недоступен' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const check = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Категория с таким именем уже существует!' });
    }
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name.trim()]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

// Купоны
app.get('/api/coupons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Сервер недоступен' });
  }
});

app.post('/api/coupons', async (req, res) => {
  const { code, discount_percent } = req.body;
  try {
    const result = await pool.query('INSERT INTO coupons (code, discount_percent) VALUES ($1, $2) RETURNING *', [code, discount_percent]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Купон с таким кодом уже существует' });
  }
});

// Заказы
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, totalAmount, itemQuantity, items } = req.body;
  try {
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const result = await pool.query(
      'INSERT INTO orders (order_number, user_id, total_amount, item_quantity, items_json) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [orderNum, userId, totalAmount, itemQuantity, JSON.stringify(items)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сохранения заказа' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));