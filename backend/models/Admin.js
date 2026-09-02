module.exports = (sequelize, DataTypes) => sequelize.define('Admin', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Admin' },
});
