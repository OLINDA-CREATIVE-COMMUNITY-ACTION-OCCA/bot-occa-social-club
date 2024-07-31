import { sequelize } from '../util/Database.js';
import { DataTypes } from "sequelize";

const Task = sequelize.define(
    'Task',
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
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
            type: DataTypes.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('eva_assigners_id')
                return rawValue ? rawValue.split(';').map(num => parseInt(num)) : null
            },
            set(val) {
                if (val == []) {
                    this.setDataValue('eva_assigners_id', null);
                } else {
                    this.setDataValue('eva_assigners_id', val.join(';'));
                }
            }
        },
        eva_description: {
            type: DataTypes.TEXT
        }
    }
);
export default Task