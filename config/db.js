var env = process.env.NODE_ENV || 'development';

if (env === 'production' || env === 'development')
	url = process.env.MONGODB_URI;
else if (env ==='test')
	url = 'mongodb://localhost:27017/bikemanager_test';

module.exports = url