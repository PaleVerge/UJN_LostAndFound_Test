const { error } = require('../utils/response')

function admin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return error(res, '无权限执行此操作', 403)
  }
  next()
}

module.exports = admin
