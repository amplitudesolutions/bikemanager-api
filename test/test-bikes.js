process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');

var Bike = require('../app/models/bike');

var should = chai.should();

chai.use(chaiHttp);

describe('Bikes', function() {

	Bike.collection.drop();

	beforeEach(function(done) {
		// When worrying about user, will need to add a new user here... and use through out tests.
		
		var newBike = new Bike({
			name: 'New Bike Name',
			year: '2000',
			size: 'Extra Small'
		});

		newBike.save(function(err) {
			done();
		})
	});

	afterEach(function(done) {
		Bike.collection.drop();
		done();
	});

	it('should list all bikes on /bikes GET', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('array');
				res.body[0].should.have.property('_id');
				res.body[0].should.have.property('name');
				res.body[0].name.should.equal('New Bike Name');
				res.body[0].should.have.property('year');
				res.body[0].year.should.equal(2000);
				res.body[0].should.have.property('size');
				res.body[0].size.should.equal('Extra Small');
				done();
			});
	});

	it('should add a single bike on /bikes POST', function(done) {
		chai.request(server)
			.post('/api/bikes')
			.send({'name': 'Transition', 'year': '2016', 'size': 'Large'})
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object')
				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.name.should.equal('Transition');
				res.body.should.have.property('year');
				res.body.year.should.equal(2016);
				res.body.should.have.property('size');
				res.body.size.should.equal('Large');
				done();
			});
	});

	it('should get a single bike /bikes/:id GET', function(done) {
		var newBike = new Bike({
			name: 'Rocky Blizzard',
			size: 'Large',
			year: '2016'
		});

		newBike.save(function(err, data) {
			chai.request(server)
				.get('/api/bikes/' + data.id)
				.end(function(err, res) {
					res.should.have.status(200);
					res.should.be.json;
					res.body.should.be.a('object');
					res.body.should.have.property('_id');
					res.body._id.should.equal(data.id);
					res.body.should.have.property('name');
					res.body.name.should.equal('Rocky Blizzard');
					res.body.should.have.property('year');
					res.body.year.should.equal(2016);
					res.body.should.have.property('size');
					res.body.size.should.equal('Large');
					done();
				});
			;
		});
	});

	it('should update a single bike on /bikes/:id PUT', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				chai.request(server)
					.put('/api/bikes/' + res.body[0]._id)
					.send({'name': 'Rocky Slayer', 'year': '1999', 'size': 'Extra Large'})
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object');
						res.body.should.have.property('_id');
						res.body.should.have.property('name');
						res.body.name.should.equal('Rocky Slayer');
						res.body.should.have.property('year');
						res.body.year.should.equal(1999);
						res.body.should.have.property('size');
						res.body.size.should.equal('Extra Large');
						done();
					})
			});
	});

	it('should delete a single bike on /bikes/:id DELETE', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				chai.request(server)
					.delete('/api/bikes/' + res.body[0]._id)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object');
						res.body.should.property('ok');
						done();
					});
			});
	});

	it('should add a new part to the build /bikes/:id/build POST', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bikeId = res.body[0]._id;
				chai.request(server)
					.post('/api/bikes/' + bikeId + '/build')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object')
						// Verify bike details haven't changed and changing the correct bike.
						res.body.should.have.property('_id');
						res.body._id.should.equal(bikeId);
						res.body.should.have.property('name');
						res.body.name.should.equal('New Bike Name');
						res.body.should.have.property('year');
						res.body.year.should.equal(2000);
						res.body.should.have.property('size');
						res.body.size.should.equal('Extra Small');
						// Verify that it added the part to the build.
						res.body.should.have.property('build');
						res.body.build.length.should.equal(1);
						res.body.build[0].should.have.property('_id');
						res.body.build[0].should.have.property('description');
						res.body.build[0].description.should.equal('Chromag Bars');
						res.body.build[0].should.have.property('url');
						res.body.build[0].url.should.equal('www.chromag.com');
						done();
					});
			});
	});

	it('should update a bike part for a build /bikes/:bike_id/build/:id PUT', function(done) {
		// Adding a new part to the build, should I do this initially? need to figure out.
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				chai.request(server)
					.post('/api/bikes/' + res.body[0]._id + '/build')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						var bike = res.body;
						chai.request(server)
						.put('/api/bikes/' + bike._id + '/build/' + bike.build[0]._id)
						.send({'description': 'Raceface Bars', 'url': 'www.raceface.com'})
						.end(function(err, res) {
							res.should.have.status(200);
							res.should.be.json;
							res.body.should.be.a('object');
							res.body.should.have.property('_id');
							res.body._id.should.equal(bike._id);
							res.body.should.have.property('name');
							res.body.name.should.equal('New Bike Name');
							res.body.should.have.property('year');
							res.body.year.should.equal(2000);
							res.body.should.have.property('size');
							res.body.size.should.equal('Extra Small');
							// res.body.should.have.property('maintenance');
							// Verify that it added the part to the build.
							res.body.should.have.property('build');
							res.body.build.length.should.equal(1);
							res.body.build[0].should.have.property('_id');
							res.body.build[0]._id.should.equal(bike.build[0]._id);
							res.body.build[0].should.have.property('description');
							res.body.build[0].description.should.equal('Raceface Bars');
							res.body.build[0].should.have.property('url');
							res.body.build[0].url.should.equal('www.raceface.com');
							done();
						});

					});
			});
	});

	it('should delete a build part /bikes/:bike_id/build/:id DELETE', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/build')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						chai.request(server)
							.delete('/api/bikes/' + res.body._id + '/build/' + res.body.build[0]._id)
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								res.body.should.have.property('_id');
								res.body._id.should.equal(bike._id);
								res.body.should.have.property('name');
								res.body.name.should.equal('New Bike Name');
								res.body.should.have.property('year');
								res.body.year.should.equal(2000);
								res.body.should.have.property('size');
								res.body.size.should.equal('Extra Small');
								res.body.build.length.should.equal(0);
								done();
							});
					});
				
			});
	});

	it('should add a new wanted item /bikes/:id/wanted POST', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bikeId = res.body[0]._id;
				chai.request(server)
					.post('/api/bikes/' + bikeId + '/wanted')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object')
						// Verify bike details haven't changed and changing the correct bike.
						res.body.should.have.property('_id');
						res.body._id.should.equal(bikeId);
						res.body.should.have.property('name');
						res.body.name.should.equal('New Bike Name');
						res.body.should.have.property('year');
						res.body.year.should.equal(2000);
						res.body.should.have.property('size');
						res.body.size.should.equal('Extra Small');
						// Verify that it added the part to the build.
						res.body.should.have.property('wanted');
						res.body.wanted.length.should.equal(1);
						res.body.wanted[0].should.have.property('_id');
						res.body.wanted[0].should.have.property('description');
						res.body.wanted[0].description.should.equal('Chromag Bars');
						res.body.wanted[0].should.have.property('url');
						res.body.wanted[0].url.should.equal('www.chromag.com');
						done();
					});
			});
	});

	it('should update a wanted item /bikes/:bike_id/wanted/:id PUT', function(done) {
		// Adding a new part to the build, should I do this initially? need to figure out.
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				chai.request(server)
					.post('/api/bikes/' + res.body[0]._id + '/wanted')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						var bike = res.body;
						chai.request(server)
						.put('/api/bikes/' + bike._id + '/wanted/' + bike.wanted[0]._id)
						.send({'description': 'Raceface Bars', 'url': 'www.raceface.com'})
						.end(function(err, res) {
							res.should.have.status(200);
							res.should.be.json;
							res.body.should.be.a('object');
							res.body.should.have.property('_id');
							res.body._id.should.equal(bike._id);
							res.body.should.have.property('name');
							res.body.name.should.equal('New Bike Name');
							res.body.should.have.property('year');
							res.body.year.should.equal(2000);
							res.body.should.have.property('size');
							res.body.size.should.equal('Extra Small');
							// res.body.should.have.property('maintenance');
							// Verify that it added the part to the build.
							res.body.should.have.property('wanted');
							res.body.wanted.length.should.equal(1);
							res.body.wanted[0].should.have.property('_id');
							res.body.wanted[0]._id.should.equal(bike.wanted[0]._id);
							res.body.wanted[0].should.have.property('description');
							res.body.wanted[0].description.should.equal('Raceface Bars');
							res.body.wanted[0].should.have.property('url');
							res.body.wanted[0].url.should.equal('www.raceface.com');
							done();
						});

					});
			});
	});

	it('should delete a wanted item /bikes/:bike_id/wanted/:id DELETE', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/wanted')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						chai.request(server)
							.delete('/api/bikes/' + res.body._id + '/wanted/' + res.body.wanted[0]._id)
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								res.body.should.have.property('_id');
								res.body._id.should.equal(bike._id);
								res.body.should.have.property('name');
								res.body.name.should.equal('New Bike Name');
								res.body.should.have.property('year');
								res.body.year.should.equal(2000);
								res.body.should.have.property('size');
								res.body.size.should.equal('Extra Small');
								res.body.wanted.length.should.equal(0);
								done();
							});
					});
				
			});
	});

	it('should add a new maintenance item /bikes/:id/maintenance POST', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bikeId = res.body[0]._id;
				chai.request(server)
					.post('/api/bikes/' + bikeId + '/maintenance')
					.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016') })
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('object')
						// Verify bike details haven't changed and changing the correct bike.
						res.body.should.have.property('_id');
						res.body._id.should.equal(bikeId);
						res.body.should.have.property('name');
						res.body.name.should.equal('New Bike Name');
						res.body.should.have.property('year');
						res.body.year.should.equal(2000);
						res.body.should.have.property('size');
						res.body.size.should.equal('Extra Small');
						// Verify that it added the part to the build.
						res.body.should.have.property('maintenance');
						res.body.maintenance.length.should.equal(1);
						res.body.maintenance[0].should.have.property('_id');
						res.body.maintenance[0].should.have.property('description');
						res.body.maintenance[0].description.should.equal('Front Brake Bleed');
						res.body.maintenance[0].should.have.property('completeddate');
						res.body.maintenance[0].completeddate.should.equal(new Date('11/12/2016').toJSON());
						done();
					});
			});
	});

	it('should update a maintenance item /bikes/:bike_id/maintenance/:id PUT', function(done) {
		// Adding a new part to the build, should I do this initially? need to figure out.
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				chai.request(server)
					.post('/api/bikes/' + res.body[0]._id + '/maintenance')
					.send({'description': 'Front Barke Bleed', 'completeddate':''})
					.end(function(err, res) {
						var bike = res.body;
						chai.request(server)
						.put('/api/bikes/' + bike._id + '/maintenance/' + bike.maintenance[0]._id)
						.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016')})
						.end(function(err, res) {
							res.should.have.status(200);
							res.should.be.json;
							res.body.should.be.a('object');
							res.body.should.have.property('_id');
							res.body._id.should.equal(bike._id);
							res.body.should.have.property('name');
							res.body.name.should.equal('New Bike Name');
							res.body.should.have.property('year');
							res.body.year.should.equal(2000);
							res.body.should.have.property('size');
							res.body.size.should.equal('Extra Small');
							// res.body.should.have.property('maintenance');
							// Verify that it added the part to the build.
							res.body.should.have.property('maintenance');
							res.body.maintenance.length.should.equal(1);
							res.body.maintenance[0].should.have.property('_id');
							res.body.maintenance[0]._id.should.equal(bike.maintenance[0]._id);
							res.body.maintenance[0].should.have.property('description');
							res.body.maintenance[0].description.should.equal('Front Brake Bleed');
							res.body.maintenance[0].should.have.property('completeddate');
							res.body.maintenance[0].completeddate.should.equal(new Date('11/12/2016').toJSON());
							done();
						});

					});
			});
	});

	it('should delete a maintenance item /bikes/:bike_id/maintenance/:id DELETE', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/maintenance')
					.send({'description': 'Rear Brake Bleed', 'completeddate':''})
					.end(function(err, res) {
						chai.request(server)
							.delete('/api/bikes/' + res.body._id + '/maintenance/' + res.body.maintenance[0]._id)
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								res.body.should.have.property('_id');
								res.body._id.should.equal(bike._id);
								res.body.should.have.property('name');
								res.body.name.should.equal('New Bike Name');
								res.body.should.have.property('year');
								res.body.year.should.equal(2000);
								res.body.should.have.property('size');
								res.body.size.should.equal('Extra Small');
								res.body.maintenance.length.should.equal(0);
								done();
							});
					});
				
			});
	});

	it('should move a wanted item to the build and remove wanted item /bikes/:bike_id/wanted/:id/got', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/wanted')
					.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
					.end(function(err, res) {
						chai.request(server)
							.get('/api/bikes/' + bike._id + '/wanted/' + res.body.wanted[0]._id + '/got')
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								res.body.should.have.property('_id');
								res.body._id.should.equal(bike._id);
								res.body.should.have.property('name');
								res.body.name.should.equal('New Bike Name');
								res.body.should.have.property('year');
								res.body.year.should.equal(2000);
								res.body.should.have.property('size');
								res.body.size.should.equal('Extra Small');
								res.body.wanted.length.should.equal(0);
								res.body.build.length.should.equal(1);
								res.body.build[0].should.have.property('_id');
								res.body.build[0].should.have.property('description');
								res.body.build[0].description.should.equal('Chromag Bars');
								res.body.build[0].should.have.property('url');
								res.body.build[0].url.should.equal('www.chromag.com');
								done();
							});
					});
				
			});
	});
})