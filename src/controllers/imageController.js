// src/controllers/imageController.js
const path = require('path');
const fs = require('fs').promises;

// Get the absolute path to the image
const imagePath = path.join(__dirname, '..', '..', 'cache', 'summary.png');

/**
 * Serves the generated summary.png file.
 */
async function serveSummaryImage(req, res, next) {
  try {
    // Check if the file exists
    await fs.access(imagePath);
    
    // Send the file
    // res.sendFile will automatically set the correct Content-Type header
    res.sendFile(imagePath);

  } catch (error) {
    // If the error code is ENOENT, it means the file was not found
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: "Summary image not found" });
    }
    // For other errors (e.g., permissions), pass to global handler
    next(error);
  }
}

module.exports = {
  serveSummaryImage,
};
