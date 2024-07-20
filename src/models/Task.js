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
        id_eva: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        title_eva: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status_number_eva: {
            type: DataTypes.INTEGER,
            allowNull: false, 
            unique: true,
        },
        sprint_name_eva: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        assigners_id_eva: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: false
        }
    }
);
// precisa fazer a relação entre User e assigners_id_eva algum tipo de verificação
module.exports = {Task}