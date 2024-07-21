const { sequelize } = require('../util/Database');
// Import the built-in data types
const { DataTypes } = require('sequelize');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        eva_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eva_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            
        }
    }
);

module.exports = { User };