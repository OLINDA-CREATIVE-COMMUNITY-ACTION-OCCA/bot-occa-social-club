const {sequelize} = require('../util/Database');
const {DataTypes} = require('sequelize')

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
        sprint_eva_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        assigners_eva_id: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false
        }
    }
);
// precisa fazer a relação entre User e assigners_eva_id algum tipo de verificação
module.exports = {Task}