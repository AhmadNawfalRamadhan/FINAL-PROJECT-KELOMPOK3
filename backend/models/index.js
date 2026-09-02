const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = require('./MenuItem')(sequelize, DataTypes);
const Admin = require('./Admin')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);

Order.hasMany(OrderItem, {
  as: 'items',
  foreignKey: 'orderId',
  onDelete: 'CASCADE',
});

OrderItem.belongsTo(Order, {
  as: 'order',
  foreignKey: 'orderId',
});

MenuItem.hasMany(OrderItem, {
  as: 'orderItems',
  foreignKey: 'menuItemId',
});

OrderItem.belongsTo(MenuItem, {
  as: 'menuItem',
  foreignKey: 'menuItemId',
});

module.exports = {
  sequelize,
  MenuItem,
  Admin,
  Order,
  OrderItem,
};
