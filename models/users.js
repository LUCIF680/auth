const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("users", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const User = sequelize.define(
  "users",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: 1,
    },
  },
  { timestamps: true, paranoid: true }
);

module.exports = User;
module.exports.sequelize = sequelize;
