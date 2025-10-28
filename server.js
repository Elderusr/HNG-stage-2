require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./src/models/index');
const notFound = require('./src/middleware/notFound');
const globalErrorHandler = require('./src/middleware/errorHandler');
const countries = require('./src/routes/countries');
const countryRouter = require('./src/routes/countryRouter.js');

const app = express();
app.use(cors());
app.use(express.json()); // this is a middleware to parse incoming JSON bodies

app.use('/', countries);
app.use('/', countryRouter);

app.get('/ping', (req, res) => {
	res.status(200).json({ message: 'Server is running!' });
});

app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
	try {
		await db.sequelize.sync({ alter: true });
		console.log('All models were synchronized successfully');
		app.listen(PORT, () => {
			console.log('server is listening on http://localhost:', PORT);
		});
	} catch (error) {
		console.error('Failed to start server', error);
	}
}

startServer();
