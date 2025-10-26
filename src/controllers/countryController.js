// src/controllers/countryController.js
const { Country, SystemStatus, sequelize } = require('../models');
const { Op } = require('sequelize'); // Import Sequelize operators

/**
 * GET /countries
 * Get all countries from the DB, with support for filters and sorting.
 * ?region=Africa
 * ?currency=NGN
 * ?sort=gdp_desc
 */
async function getAllCountries(req, res, next) {
  try {
    const { region, currency, sort } = req.query;
    const options = {
      where: {},
      order: [],
    };

    // 1. Build Filter (WHERE clause)
    const whereConditions = [];
    if (region) {
      whereConditions.push({ region: { [Op.eq]: region } });
    }
    if (currency) {
      whereConditions.push({ currency_code: { [Op.eq]: currency } });
    }
    if (whereConditions.length > 0) {
      options.where = { [Op.and]: whereConditions };
    }

    // 2. Build Sorting (ORDER BY clause)
    if (sort === 'gdp_desc') {
      // Order by estimated_gdp in descending order
      // Handle nulls by placing them last
      options.order.push([sequelize.fn('ISNULL', sequelize.col('estimated_gdp')), 'ASC']);
      options.order.push(['estimated_gdp', 'DESC']);
    } else {
      // Default sort by name A-Z
      options.order.push(['name', 'ASC']);
    }

    // 3. Execute Query
    const countries = await Country.findAll(options);
    res.status(200).json(countries);

  } catch (error) {
    next(error);
  }
}

/**
 * GET /countries/:name
 * Get one country by its (case-sensitive) name.
 */
async function getCountryByName(req, res, next) {
  try {
    const { name } = req.params;
    const country = await Country.findOne({ where: { name: name } });

    if (country) {
      res.status(200).json(country);
    } else {
      // Manually trigger a 404 error
      const error = new Error('Country not found');
      error.name = 'NotFoundError'; // This name is caught by our global error handler
      next(error);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /countries/:name
 * Delete one country by its (case-sensitive) name.
 */
async function deleteCountryByName(req, res, next) {
  try {
    const { name } = req.params;
    const result = await Country.destroy({ where: { name: name } });

    if (result > 0) {
      // result is the number of rows deleted
      res.status(200).json({ message: 'Country deleted successfully' });
    } else {
      // No rows were deleted, meaning the country wasn't found
      const error = new Error('Country not found');
      error.name = 'NotFoundError';
      next(error);
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /status
 * Show total countries and last refresh timestamp.
 */
async function getStatus(req, res, next) {
  try {
    const status = await SystemStatus.findByPk(1); // Find by primary key (id = 1)

    if (status) {
      res.status(200).json({
        total_countries: status.total_countries,
        last_refreshed_at: status.last_refreshed_at,
      });
    } else {
      // If no status row exists (e.g., refresh hasn't run), return defaults
      res.status(200).json({
        total_countries: 0,
        last_refreshed_at: null,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
};
