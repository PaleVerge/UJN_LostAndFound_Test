const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  type: {
    type: DataTypes.ENUM('lost', 'found'),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('证件', '电子产品', '生活用品', '其他'),
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING(100),
    defaultValue: '',
  },
  contact_info: {
    type: DataTypes.STRING(100),
    defaultValue: '',
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '0: 展示中, 1: 已结案',
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
})

module.exports = Item
