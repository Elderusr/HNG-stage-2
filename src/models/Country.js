// src/models/Country.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures country names are unique
  },
  capital: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  population: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  currency_code: {
    type: DataTypes.STRING(10), // e.g., "NGN" or "USD"
    allowNull: true,
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(20, 8), // For high precision
    allowNull: true,
  },
  estimated_gdp: {
    type: DataTypes.DECIMAL(30, 8), // For large numbers
    allowNull: true,
  },
  flag_url: {
    type: DataTypes.STRING(1024), // URLs can be long
    allowNull: true,
  },
}, {
  // Model options
  tableName: 'countries',
  timestamps: true, // Enables createdAt and updatedAt
  createdAt: 'created_at', // Rename createdAt to match our preference
  updatedAt: 'last_refreshed_at', // This field will auto-update on every change
});

module.exports = Country;
