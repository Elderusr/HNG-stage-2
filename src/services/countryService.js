
const axios = require('axios');
const Country = require('../models/Country');

const fetchAndStoreCountries = async () => {
  try {
    // Fetch country data
    const countriesResponse = await axios.get('https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies');
    const countries = countriesResponse.data;

    // Fetch exchange rates
    const exchangeRatesResponse = await axios.get('https://open.er-api.com/v6/latest/USD');
    const rates = exchangeRatesResponse.data.rates;

    for (const countryData of countries) {
      const currency = countryData.currencies && countryData.currencies[0];
      if (!currency) continue;

      const currencyCode = currency.code;
      const exchangeRate = rates[currencyCode];

      if (exchangeRate) {
        const estimatedGdp = (countryData.population * (Math.random() * (2000 - 1000) + 1000)) / exchangeRate;

        await Country.upsert({
          name: countryData.name,
          capital: countryData.capital,
          region: countryData.region,
          population: countryData.population,
          currency_code: currencyCode,
          exchange_rate: exchangeRate,
          estimated_gdp: estimatedGdp,
          flag_url: countryData.flag,
        });
      }
    }

    console.log('Country data updated successfully.');
  } catch (error) {
    console.error('Error updating country data:', error);
  }
};

module.exports = {
  fetchAndStoreCountries,
};
