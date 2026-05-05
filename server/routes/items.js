const router = require('express').Router()
const { Op } = require('sequelize')
const multer = require('multer')
const path = require('path')
const { Item, User } = require('../models')
const { success, error } = require('../utils/response')
const auth = require('../middleware/auth')

// Multer config
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
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, allowed.includes(ext))
  },
})

// GET /api/items — public list with pagination, search, filter
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, type, category } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const where = {}
    // Default: only show active posts on public listing
    where.status = 0

    if (type && ['lost', 'found'].includes(type)) {
      where.type = type
    }
    if (category) {
      where.category = category
    }
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { location: { [Op.like]: `%${keyword}%` } },
      ]
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [['create_time', 'DESC']],
      offset,
      limit: Number(limit),
    })

    return success(res, {
      list: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/items/my — current user's posts
router.get('/my', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows } = await Item.findAndCountAll({
      where: { userId: req.user.id },
      order: [['create_time', 'DESC']],
      offset,
      limit: Number(limit),
    })

    return success(res, { list: rows, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) {
    next(err)
  }
})

// GET /api/items/:id — single item detail
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
    })
    if (!item) return error(res, '帖子不存在', 404)
    return success(res, item)
  } catch (err) {
    next(err)
  }
})

// POST /api/items — create (auth required)
router.post('/', auth, upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, type, category, location, contact_info } = req.body

    if (!title || !type || !category) {
      return error(res, '标题、类型和分类为必填项', 400)
    }

    const item = await Item.create({
      title,
      description: description || '',
      type,
      category,
      location: location || '',
      contact_info: contact_info || '',
      image_url: req.file ? `/uploads/${req.file.filename}` : '',
      userId: req.user.id,
    })

    return success(res, item, '发布成功')
  } catch (err) {
    next(err)
  }
})

// PUT /api/items/:id — update (owner or admin)
router.put('/:id', auth, upload.single('image'), async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return error(res, '帖子不存在', 404)

    if (item.userId !== req.user.id && req.user.role !== 'admin') {
      return error(res, '无权限修改此帖子', 403)
    }

    const { title, description, type, category, location, contact_info } = req.body
    const updates = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (type !== undefined) updates.type = type
    if (category !== undefined) updates.category = category
    if (location !== undefined) updates.location = location
    if (contact_info !== undefined) updates.contact_info = contact_info
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`

    await item.update(updates)
    return success(res, item, '更新成功')
  } catch (err) {
    next(err)
  }
})

// DELETE /api/items/:id — delete (owner or admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return error(res, '帖子不存在', 404)

    if (item.userId !== req.user.id && req.user.role !== 'admin') {
      return error(res, '无权限删除此帖子', 403)
    }

    await item.destroy()
    return success(res, null, '删除成功')
  } catch (err) {
    next(err)
  }
})

// PUT /api/items/:id/status — toggle status
router.put('/:id/status', auth, async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id)
    if (!item) return error(res, '帖子不存在', 404)

    if (item.userId !== req.user.id && req.user.role !== 'admin') {
      return error(res, '无权限修改此帖子', 403)
    }

    const newStatus = item.status === 0 ? 1 : 0
    await item.update({ status: newStatus })
    return success(res, { status: newStatus }, newStatus === 1 ? '已标记为已结案' : '已重新公开')
  } catch (err) {
    next(err)
  }
})

module.exports = router
