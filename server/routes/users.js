const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { User } = require('../models')
const { success, error } = require('../utils/response')
const auth = require('../middleware/auth')

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

// GET /api/users/profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar', 'contact', 'role'],
    })
    if (!user) return error(res, '用户不存在', 404)
    return success(res, user)
  } catch (err) {
    next(err)
  }
})

// PUT /api/users/profile
router.put('/profile', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return error(res, '用户不存在', 404)

    const { contact, oldPassword, newPassword } = req.body
    const updates = {}

    if (contact !== undefined) updates.contact = contact

    if (newPassword) {
      if (!oldPassword) return error(res, '请输入旧密码', 400)
      const valid = await user.comparePassword(oldPassword)
      if (!valid) return error(res, '旧密码错误', 400)
      if (newPassword.length < 6) return error(res, '新密码至少6位', 400)
      updates.password = newPassword
    }

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`
    }

    await user.update(updates)
    return success(res, {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      contact: user.contact,
      role: user.role,
    }, '更新成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
