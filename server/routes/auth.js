const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { success, error } = require('../utils/response')

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, contact } = req.body

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

    const user = await User.create({ username, password, contact: contact || '' })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return success(res, {
      token,
      user: { id: user.id, username: user.username, avatar: user.avatar, contact: user.contact, role: user.role },
    }, '注册成功')
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 400)
    }

    const user = await User.findOne({ where: { username } })
    if (!user) {
      return error(res, '用户名或密码错误', 401)
    }

    if (user.status === 1) {
      return error(res, '账号已被封禁，请联系管理员', 403)
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return error(res, '用户名或密码错误', 401)
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return success(res, {
      token,
      user: { id: user.id, username: user.username, avatar: user.avatar, contact: user.contact, role: user.role },
    }, '登录成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
