const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { error } = require('../utils/response')

async function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, '请先登录', 401)
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'role', 'status'] })
    if (!user) {
      return error(res, '用户不存在', 401)
    }
    if (user.status === 1) {
      return error(res, '账号已被封禁，请联系管理员', 403)
    }
    req.user = { id: user.id, role: user.role }
    next()
  } catch {
    return error(res, '登录已过期，请重新登录', 401)
  }
}

module.exports = auth
