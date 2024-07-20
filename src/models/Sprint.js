const { sequelize } = require('../util/Database');
const {DataTypes} = require('sequelize');

/**
 * Model para sprint o slug é um identificador único para a sprint, como um id
 */
const Sprint = sequelize.define(
    'Sprint',
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
            unique: true,
        },
        slug_eva: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name_eva: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

module.exports = { Sprint }