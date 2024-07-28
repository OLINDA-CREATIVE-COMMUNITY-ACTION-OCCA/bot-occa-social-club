import {sequelize} from '../util/Database.js';
import { DataTypes } from 'sequelize';

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
        eva_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        eva_slug: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        eva_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
);

export default Sprint