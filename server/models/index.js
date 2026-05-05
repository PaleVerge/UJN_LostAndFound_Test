const { sequelize } = require('../config/database')
const User = require('./User')
const Item = require('./Item')

User.hasMany(Item, { foreignKey: 'userId' })
Item.belongsTo(User, { foreignKey: 'userId' })

module.exports = { sequelize, User, Item }
