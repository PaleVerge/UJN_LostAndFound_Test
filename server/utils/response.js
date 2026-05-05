function success(res, data = null, msg = 'success') {
  return res.json({ code: 200, data, msg })
}

function error(res, msg = '服务器内部错误', code = 500) {
  return res.status(code).json({ code, data: null, msg })
}

module.exports = { success, error }
