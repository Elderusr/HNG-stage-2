// src/services/refreshService.js
const axios = require('axios');
const { sequelize, Country, SystemStatus } = require('../models');
const ApiError = require('../middleware/ApiError');

/**
 * Fetches all external data, processes it, and caches it in the database.
 */
async function fetchAndCacheData() {
  const refreshStartTime = new Date();
  let rates = {};
  let countries = [];

  // 1. Fetch Exchange Rates
  try {
    const response = await axios.get(process.env.EXCHANGE_RATE_API_URL);
    rates = response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    throw new ApiError('Could not fetch data from Open ER API');
  }

  // 2. Fetch Countries
  try {
    const response = await axios.get(process.env.COUNTRIES_API_URL);
    countries = response.data;
  } catch (error) {
    console.error('Error fetching countries:', error.message);
    throw new ApiError('Could not fetch data from REST Countries');
  }

  // 3. Start a database transaction
  // This ensures that if any country fails to save, nothing is saved.
  const t = await sequelize.transaction();

  try {
    // 4. Process and Upsert each country
    // We use Promise.all to run these in parallel for speed.
    await Promise.all(countries.map(async (country) => {
      // --- Validation ---
      if (!country.name || !country.population) {
        console.warn(`Skipping country with missing name or population: ${JSON.stringify(country)}`);
        return; // Skip this record
      }
      
      let currency_code = null;
      let exchange_rate = null;
      let estimated_gdp = null;

      // --- Currency & GDP Logic ---
      if (country.currencies && country.currencies.length > 0 && country.currencies[0].code) {
        // Rule: Use the first currency code
        currency_code = country.currencies[0].code;
        
        if (rates[currency_code]) {
          // Rule: Currency found in exchange rates
          exchange_rate = rates[currency_code];
          
          // Rule: Compute GDP
          const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
          estimated_gdp = (country.population * randomMultiplier) / exchange_rate;
        } else {
          // Rule: Currency code not in rates API
          exchange_rate = null;
          estimated_gdp = null;
        }
      } else {
        // Rule: Currencies array is empty
        currency_code = null;
        exchange_rate = null;
        estimated_gdp = 0; // As specified in the rules
      }
      
      // --- Prepare data for DB ---
      const countryData = {
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        flag_url: country.flag || null,
        currency_code: currency_code,
        exchange_rate: exchange_rate,
        estimated_gdp: estimated_gdp,
      };

      // 5. Upsert (Update or Insert)
      // This command finds a country by 'name' (our unique key).
      // If it exists, it updates it. If not, it inserts it.
      await Country.upsert(countryData, { transaction: t });
    }));

    // 6. Update Global Status
    const total = await Country.count({ transaction: t });
    
    await SystemStatus.upsert({
      id: 1,
      last_refreshed_at: refreshStartTime,
      total_countries: total,
    }, { transaction: t });

    // 7. If everything is successful, commit the transaction
    await t.commit();
    
    console.log('✅ Database refresh successful.');
    // Note: We'll trigger image generation from the controller *after* this succeeds.
    return { total, timestamp: refreshStartTime };

  } catch (error) {
    // 8. If any error occurred, roll back all changes
    await t.rollback();
    console.error('❌ Database refresh failed. Rolling back changes.', error);
    // Re-throw the error so the controller can catch it
    throw error;
  }
}

module.exports = {
  fetchAndCacheData,
};
