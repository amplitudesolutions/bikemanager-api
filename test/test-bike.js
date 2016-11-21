process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');

var Bike = require('../app/models/bike');
var User = require('../app/models/user');

var should = chai.should();

chai.use(chaiHttp);

describe('Bikes', function() {

	User.collection.drop();
	Bike.collection.drop();

	beforeEach(function(done) {
		// Create a default user in db.
		chai.request(server)
			.post('/api/users')
			.send({'name': 'John Doe', 'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object')
				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.name.should.equal('John Doe');
				res.body.should.have.property('email');
				res.body.email.should.equal('jdoe@doe.com');
				res.body.should.not.have.property('password');

				var newBike = new Bike({
					name: 'New Bike Name',
					year: '2000',
					size: 'Extra Small',
					user: res.body._id
				});
		
				newBike.save(function(err) {
					done();
				});
			});

	});

	afterEach(function(done) {
		User.collection.drop();
		Bike.collection.drop();
		done();
	});

	it('should list all bikes for a user on /bikes GET', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var results = res.body;
				
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', results.token)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('array');
						res.body.length.should.equal(1);
						res.body[0].should.have.property('_id');
						res.body[0].should.have.property('name');
						res.body[0].name.should.equal('New Bike Name');
						res.body[0].should.have.property('year');
						res.body[0].year.should.equal(2000);
						res.body[0].should.have.property('size');
						res.body[0].size.should.equal('Extra Small');
						res.body[0].user.should.equal(results.user._id);
						done();
					});
		});
		
	});

	it('should add a single bike on /bikes POST', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var results = res.body;
		
				chai.request(server)
				.post('/api/bikes')
				.set('authorization', results.token)
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
					res.body.user.should.equal(results.user._id);
					done();
				});
			});
		
	});

	it('should get a single bike /bikes/:id GET', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var results = res.body;
		
				var newBike = new Bike({
					name: 'Rocky Blizzard',
					size: 'Large',
					year: '2016',
					user: results.user._id
				});
		
				newBike.save(function(err, data) {
					chai.request(server)
						.get('/api/bikes/' + data.id)
						.set('authorization', results.token)
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
							res.body.user.should.equal(results.user._id);
							done();
						});
					;
				});
			});
	});

	it('should update a single bike on /bikes/:id PUT', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var results = res.body;
				
				chai.request(server)
					.get('/api/bikes')
					.set('authorization',results.token)
					.end(function(err, res) {
						chai.request(server)
							.put('/api/bikes/' + res.body[0]._id)
							.set('authorization', results.token)
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
								res.body.user.should.equal(results.user._id);
								done();
							})
					});
			});
	});

	it('should delete a single bike on /bikes/:id DELETE', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var token = res.body.token;
			
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', token)
					.end(function(err, res) {
						chai.request(server)
							.delete('/api/bikes/' + res.body[0]._id)
							.set('authorization', token)
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								res.body.should.property('ok');
								done();
							});
					});
			});
	});

	describe('Build Items', function() {
		it('should get all build items for a bike /bikes/:id/build GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', token)
						.end(function(err, res) {
							var bikeId = res.body[0]._id;
							chai.request(server)
								.post('/api/bikes/' + bikeId + '/build')
								.set('authorization', token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bikeId + '/build')
										.set('authorization', token)
										.end(function(err, res) {
											res.should.have.status(200);
											res.should.be.json;
											res.body.should.be.a('array');
											res.body.length.should.equal(1);
											res.body[0].should.have.property('_id');
											res.body[0].should.have.property('description');
											res.body[0].description.should.equal('Chromag Bars');
											res.body[0].should.have.property('url');
											res.body[0].url.should.equal('www.chromag.com');
											done();
										});
								});
						});
				});
		});

		it('should add a new part to the build /bikes/:id/build POST', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', results.token)
					.end(function(err, res) {
						var bikeId = res.body[0]._id;
						chai.request(server)
							.post('/api/bikes/' + bikeId + '/build')
							.set('authorization', results.token)
							.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;
								res.body.should.be.a('object');
								// Verify bike details haven't changed and changing the correct bike.
								res.body.should.have.property('_id');
								res.body._id.should.equal(bikeId);
								res.body.should.have.property('name');
								res.body.name.should.equal('New Bike Name');
								res.body.should.have.property('year');
								res.body.year.should.equal(2000);
								res.body.should.have.property('size');
								res.body.size.should.equal('Extra Small');
								res.body.user.should.equal(results.user._id);
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
		});

		it('should get an individual build item /bikes/:bike_id/build/:id GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', token)
					.end(function(err, res) {
						var bike = res.body[0];
						chai.request(server)
							.post('/api/bikes/' + bike._id + '/build')
							.set('authorization', token)
							.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
							.end(function(err, res) {
								chai.request(server)
									.get('/api/bikes/' + bike._id + '/build/' + res.body.build[0]._id)
									.set('authorization', token)
									.end(function(err, res) {
										// console.log(res);
										res.should.have.status(200);
										res.should.be.json;
										res.body.should.be.a('object');
										res.body.should.have.property('description');
										res.body.description.should.equal('Chromag Bars');
										res.body.should.have.property('url');
										res.body.url.should.equal('www.chromag.com');
										done();
									});
							});
					});
				});
		});

		it('should update a bike part for a build /bikes/:bike_id/build/:id PUT', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
				// Adding a new part to the build, should I do this initially? need to figure out.
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', results.token)
					.end(function(err, res) {
						chai.request(server)
							.post('/api/bikes/' + res.body[0]._id + '/build')
							.set('authorization', results.token)
							.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
							.end(function(err, res) {
								var bike = res.body;
								chai.request(server)
								.put('/api/bikes/' + bike._id + '/build/' + bike.build[0]._id)
								.set('authorization', results.token)
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
									res.body.user.should.equal(results.user._id);
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
		});

		it('should delete a build part /bikes/:bike_id/build/:id DELETE', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
				chai.request(server)
					.get('/api/bikes')
					.set('authorization', results.token)
					.end(function(err, res) {
						var bike = res.body[0];
						chai.request(server)
							.post('/api/bikes/' + bike._id + '/build')
							.set('authorization', results.token)
							.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
							.end(function(err, res) {
								chai.request(server)
									.delete('/api/bikes/' + res.body._id + '/build/' + res.body.build[0]._id)
									.set('authorization', results.token)
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
										res.body.user.should.equal(results.user._id);
										res.body.build.length.should.equal(0);
										done();
									});
							});
						
					});
				});
		});
	});

	describe('Wanted Items', function() {
		it('should get all wanted items for a bike /bikes/:id/wanted GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', token)
						.end(function(err, res) {
							var bikeId = res.body[0]._id;
							chai.request(server)
								.post('/api/bikes/' + bikeId + '/wanted')
								.set('authorization', token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bikeId + '/wanted')
										.set('authorization', token)
										.end(function(err, res) {
											res.should.have.status(200);
											res.should.be.json;
											res.body.should.be.a('array');
											res.body.length.should.equal(1);
											res.body[0].should.have.property('_id');
											res.body[0].should.have.property('description');
											res.body[0].description.should.equal('Chromag Bars');
											res.body[0].should.have.property('url');
											res.body[0].url.should.equal('www.chromag.com');
											done();
										});
								});
						});
				});
		});

		it('should add a new wanted item /bikes/:id/wanted POST', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							var bikeId = res.body[0]._id;
							chai.request(server)
								.post('/api/bikes/' + bikeId + '/wanted')
								.set('authorization', results.token)
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
									res.body.user.should.equal(results.user._id);
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
		});

		it('should get an individual wanted item /bikes/:bike_id/wanted/:id GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', token)
						.end(function(err, res) {
							var bike = res.body[0];
							chai.request(server)
								.post('/api/bikes/' + bike._id + '/wanted')
								.set('authorization', token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bike._id + '/wanted/' + res.body.wanted[0]._id)
										.set('authorization', token)
										.end(function(err, res) {
											res.should.have.status(200);
											res.should.be.json;
											res.body.should.be.a('object');
											res.body.should.have.property('description');
											res.body.description.should.equal('Chromag Bars');
											res.body.should.have.property('url');
											res.body.url.should.equal('www.chromag.com');
											done();
										});
								});
						});
				});
		});

		it('should update a wanted item /bikes/:bike_id/wanted/:id PUT', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					// Adding a new part to the build, should I do this initially? need to figure out.
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							chai.request(server)
								.post('/api/bikes/' + res.body[0]._id + '/wanted')
								.set('authorization', results.token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									var bike = res.body;
									chai.request(server)
									.put('/api/bikes/' + bike._id + '/wanted/' + bike.wanted[0]._id)
									.set('authorization', results.token)
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
										res.body.user.should.equal(results.user._id);
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
		});

		it('should delete a wanted item /bikes/:bike_id/wanted/:id DELETE', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							var bike = res.body[0];
							chai.request(server)
								.post('/api/bikes/' + bike._id + '/wanted')
								.set('authorization', results.token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									chai.request(server)
										.delete('/api/bikes/' + res.body._id + '/wanted/' + res.body.wanted[0]._id)
										.set('authorization', results.token)
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
											res.body.user.should.equal(results.user._id);
											res.body.wanted.length.should.equal(0);
											done();
										});
								});
						});
				});
		});

		it('should move a wanted item to the build and remove wanted item /bikes/:bike_id/wanted/:id/got', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							var bike = res.body[0];
							chai.request(server)
								.post('/api/bikes/' + bike._id + '/wanted')
								.set('authorization', results.token)
								.send({'description': 'Chromag Bars', 'url':'www.chromag.com'})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bike._id + '/wanted/' + res.body.wanted[0]._id + '/got')
										.set('authorization', results.token)
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
											res.body.user.should.equal(results.user._id);
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
		});
	});

	describe('Maintenance Items', function() {

		it('should get all build items for a bike /bikes/:id/maintenance GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', token)
						.end(function(err, res) {
							var bikeId = res.body[0]._id;
							chai.request(server)
								.post('/api/bikes/' + bikeId + '/maintenance')
								.set('authorization', token)
								.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016')})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bikeId + '/maintenance')
										.set('authorization', token)
										.end(function(err, res) {
											res.should.have.status(200);
											res.should.be.json;
											res.body.should.be.a('array');
											res.body.length.should.equal(1);
											res.body[0].should.have.property('_id');
											res.body[0].should.have.property('description');
											res.body[0].description.should.equal('Front Brake Bleed');
											res.body[0].should.have.property('completeddate');
											res.body[0].completeddate.should.equal(new Date('11/12/2016').toJSON());
											done();
										});
								});
						});
				});
		});

		it('should add a new maintenance item /bikes/:id/maintenance POST', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							var bikeId = res.body[0]._id;
							chai.request(server)
								.post('/api/bikes/' + bikeId + '/maintenance')
								.set('authorization', results.token)
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
									res.body.user.should.equal(results.user._id);
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
		});

		it('should get an individual maintenance item /bikes/:bike_id/maintenance/:id GET', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var token = res.body.token;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', token)
						.end(function(err, res) {
							var bike = res.body[0];
							chai.request(server)
								.post('/api/bikes/' + bike._id + '/maintenance')
								.set('authorization', token)
								.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016')})
								.end(function(err, res) {
									chai.request(server)
										.get('/api/bikes/' + bike._id + '/maintenance/' + res.body.maintenance[0]._id)
										.set('authorization', token)
										.end(function(err, res) {
											res.should.have.status(200);
											res.should.be.json;
											res.body.should.be.a('object');
											res.body.should.have.property('description');
											res.body.description.should.equal('Front Brake Bleed');
											res.body.should.have.property('completeddate');
											res.body.completeddate.should.equal(new Date('11/12/2016').toJSON());
											done();
										});
								});
						});
				});
		});

		it('should update a maintenance item /bikes/:bike_id/maintenance/:id PUT', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					// Adding a new part to the build, should I do this initially? need to figure out.
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							chai.request(server)
								.post('/api/bikes/' + res.body[0]._id + '/maintenance')
								.set('authorization', results.token)
								.send({'description': 'Front Barke Bleed', 'completeddate':''})
								.end(function(err, res) {
									var bike = res.body;
									chai.request(server)
									.put('/api/bikes/' + bike._id + '/maintenance/' + bike.maintenance[0]._id)
									.set('authorization', results.token)
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
										res.body.user.should.equal(results.user._id);
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
		});

		it('should delete a maintenance item /bikes/:bike_id/maintenance/:id DELETE', function(done) {
			chai.request(server)
				.post('/api/authenticate')
				.send({'email': 'jdoe@doe.com', 'password': 'the password'})
				.end(function(err, res) {
					var results = res.body;
				
					chai.request(server)
						.get('/api/bikes')
						.set('authorization', results.token)
						.end(function(err, res) {
							var bike = res.body[0];
							chai.request(server)
								.post('/api/bikes/' + bike._id + '/maintenance')
								.set('authorization', results.token)
								.send({'description': 'Rear Brake Bleed', 'completeddate':''})
								.end(function(err, res) {
									chai.request(server)
										.delete('/api/bikes/' + res.body._id + '/maintenance/' + res.body.maintenance[0]._id)
										.set('authorization', results.token)
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
											res.body.user.should.equal(results.user._id);
											res.body.maintenance.length.should.equal(0);
											done();
										});
								});
						});
				});
		});
	});

});
