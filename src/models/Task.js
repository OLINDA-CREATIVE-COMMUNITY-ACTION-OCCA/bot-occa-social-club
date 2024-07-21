const { sequelize } = require('../util/Database');
const { DataTypes } = require('sequelize')

const Task = sequelize.define(
    'Task',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        eva_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        eva_title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        eva_status_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        eva_status_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eva_sprint_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eva_assigners_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false
        },
        eva_description: {
            type: DataTypes.TEXT
        }
    }
);
// precisa fazer a relação entre User e assigners_eva_id algum tipo de verificação
module.exports = { Task }