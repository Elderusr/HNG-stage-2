const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const SystemStatus = sequelize.define('SystemStatus', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		defaultValue: 1,
	},
	last_refreshed_at: {
		type: DataTypes.DATE,
		allowNull: true,
	},
	total_countries: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
	},
}, {
	tableName: 'system_status',
	timestamps: false, // Disable createdAt/updatedAt for this table
});

module.exports = SystemStatus;
