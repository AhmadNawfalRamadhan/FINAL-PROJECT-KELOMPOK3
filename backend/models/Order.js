module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('menunggu', 'diproses', 'selesai', 'dibatalkan'),
        allowNull: false,
        defaultValue: 'menunggu',
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'cart',
      },
    },
    {
      tableName: 'orders',
      timestamps: true,
    }
  );

  return Order;
};
