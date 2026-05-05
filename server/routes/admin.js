const router = require('express').Router()
const { Op } = require('sequelize')
const multer = require('multer')
const path = require('path')
const { Item, User } = require('../models')
const { success, error } = require('../utils/response')
const auth = require('../middleware/auth')
const adminGuard = require('../middleware/admin')

router.use(auth, adminGuard)

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', process.env.UPLOAD_DIR || 'public/uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()))
  },
})

// ==================== Items CRUD ====================

// GET /api/admin/items — list all items with search
router.get('/items', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where = {}
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ]
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'username'] }],
      order: [['create_time', 'DESC']],
      offset,
      limit: Number(limit),
    })

    return success(res, { list: rows, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/items/:id — single item detail
router.get('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username'] }],
    })
    if (!item) return error(res, '帖子不存在', 404)
    return success(res, item)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/items — create item
router.post('/items', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, type, category, location } = req.body

    if (!title || !type || !category) {
      return error(res, '标题、类型和分类为必填项', 400)
    }

    const item = await Item.create({
      title,
      description: description || '',
      type,
      category,
      location: location || '',
      image_url: req.file ? `/uploads/${req.file.filename}` : '',
      userId: req.user.id,
    })

    return success(res, item, '创建成功')
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/items/:id — edit any item
router.put('/items/:id', upload.single('image'), async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return error(res, '帖子不存在', 404)

    const { title, description, type, category, location, status } = req.body
    const updates = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (category !== undefined) updates.category = category
    if (location !== undefined) updates.location = location
    if (status !== undefined) updates.status = Number(status)
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`

    await item.update(updates)
    return success(res, item, '更新成功')
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/items/:id — force delete
router.delete('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return error(res, '帖子不存在', 404)
    await item.destroy()
    return success(res, null, '已删除')
  } catch (err) {
    next(err)
  }
})

// ==================== Users CRUD ====================

// GET /api/admin/users — user list with search
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where = {}
    if (keyword) {
      where.username = { [Op.like]: `%${keyword}%` }
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'avatar', 'contact', 'role', 'status'],
      order: [['id', 'ASC']],
      offset,
      limit: Number(limit),
    })

    return success(res, { list: rows, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// GET /api/admin/users/:id — single user detail
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'avatar', 'contact', 'role', 'status'],
    })
    if (!user) return error(res, '用户不存在', 404)
    return success(res, user)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/users — create user
router.post('/users', async (req, res, next) => {
  try {
    const { username, password, contact, role } = req.body

    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 400)
    }
    if (password.length < 6) {
      return error(res, '密码至少6位', 400)
    }

    const exists = await User.findOne({ where: { username } })
    if (exists) {
      return error(res, '用户名已存在', 409)
    }

    const user = await User.create({
      username,
      password,
      contact: contact || '',
      role: role || 'user',
    })

    return success(res, {
      id: user.id, username: user.username, contact: user.contact, role: user.role, status: user.status,
    }, '创建成功')
  } catch (err) {
    next(err)
  }
})

// PUT /api/admin/users/:id — edit user
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return error(res, '用户不存在', 404)

    const { username, password, contact, role, status } = req.body
    const updates = {}

    if (username !== undefined && username !== user.username) {
      const dup = await User.findOne({ where: { username } })
      if (dup && dup.id !== user.id) {
        return error(res, '用户名已被占用', 409)
      }
      updates.username = username
    }
    if (password !== undefined && password !== '') updates.password = password
    if (contact !== undefined) updates.contact = contact
    if (role !== undefined) updates.role = role
    if (status !== undefined) updates.status = Number(status)

    await user.update(updates)

    return success(res, {
      id: user.id, username: user.username, contact: user.contact, role: user.role, status: user.status,
    }, '更新成功')
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return error(res, '用户不存在', 404)
    if (user.role === 'admin') return error(res, '不能删除管理员账号', 400)
    await user.destroy()
    return success(res, null, '已删除')
  } catch (err) {
    next(err)
  }
})

module.exports = router
