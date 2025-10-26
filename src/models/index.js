const sequelize = require('../config/database');
const Country = require('./Country');
const SystemStatus = require('./SystemStatus');



const db = {};

db.sequelize = sequelize;
db.Country = Country;
db.SystemStatus = SystemStatus;

module.exports = db;
