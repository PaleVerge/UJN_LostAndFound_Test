require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const { sequelize } = require('./models')

const app = express()

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/items', require('./routes/items'))
app.use('/api/users', require('./routes/users'))
app.use('/api/admin', require('./routes/admin'))

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ code: status, data: null, msg: err.message || '服务器内部错误' })
})

const PORT = process.env.PORT || 3001

sequelize.sync({ alter: false }).then(() => {
  console.log('Database synced')
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}).catch((err) => {
  console.error('Unable to sync database:', err)
  process.exit(1)
})

module.exports = app
