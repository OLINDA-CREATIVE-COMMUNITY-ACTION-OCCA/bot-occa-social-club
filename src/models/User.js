import {sequelize} from '../util/Database.js';
import { DataTypes } from 'sequelize';

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
export default User