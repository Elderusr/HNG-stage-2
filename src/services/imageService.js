// src/services/imageService.js
const jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises; // Using the promise-based version of fs
const { Country, SystemStatus } = require('../models');

// Define the path where the image will be saved
const imagePath = path.join(__dirname, '..', '..', 'cache', 'summary.png');
const cacheDir = path.dirname(imagePath);

/**
 * Generates a summary image with stats and saves it to the /cache directory.
 */
async function generateSummaryImage() {
  try {
    console.log('Generating summary image...');

    // 1. Fetch data from the database
    const topCountries = await Country.findAll({
      order: [['estimated_gdp', 'DESC']],
      limit: 5,
      attributes: ['name', 'estimated_gdp'],
    });

    const status = await SystemStatus.findByPk(1);

    if (!status) {
      console.error('Cannot generate image: SystemStatus not found.');
      return;
    }

    // 2. Ensure the /cache directory exists
    await fs.mkdir(cacheDir, { recursive: true });

    // 3. Load fonts (Jimp comes with some built-in fonts)
    const titleFont = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
    const textFont = await jimp.loadFont(jimp.FONT_SANS_16_BLACK);

    // 4. Create a new image canvas
    const image = new jimp(600, 400, '#FFFFFF'); // 600px wide, 400px tall, white background

    // 5. Draw the text onto the image
    image.print(titleFont, 20, 20, 'Country Data Summary');

    const totalStr = `Total Countries: ${status.total_countries}`;
    const dateStr = `Last Refresh: ${status.last_refreshed_at.toLocaleString()}`;
    image.print(textFont, 20, 70, totalStr);
    image.print(textFont, 20, 95, dateStr);

    image.print(textFont, 20, 140, 'Top 5 Countries by Estimated GDP:');

    // Print each country
    let yPos = 165;
    topCountries.forEach((country, index) => {
      const gdp = parseFloat(country.estimated_gdp).toFixed(2);
      const line = `${index + 1}. ${country.name} - $${gdp}`;
      image.print(textFont, 20, yPos, line);
      yPos += 25; // Move down for the next line
    });

    // 6. Save the image to the file system
    await image.writeAsync(imagePath);
    console.log(`✅ Summary image saved to ${imagePath}`);

  } catch (error) {
    console.error('❌ Failed to generate summary image:', error);
  }
}

module.exports = {
  generateSummaryImage,
};
