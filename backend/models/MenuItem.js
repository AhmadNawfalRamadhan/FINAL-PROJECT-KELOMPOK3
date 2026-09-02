module.exports = (sequelize, DataTypes) => sequelize.define('MenuItem', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('utama','minuman','dessert'), allowNull: false, defaultValue: 'utama' },
  price: { type: DataTypes.INTEGER, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  ingredients: { type: DataTypes.TEXT, defaultValue: '' },
  taste: { type: DataTypes.STRING, defaultValue: '' },
  origin: { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT, defaultValue: '' },
  image: { type: DataTypes.STRING, defaultValue: '' },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
});
