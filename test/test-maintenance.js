process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');

var Bike = require('../app/models/bike');
var Maintenance = require('../app/models/bike-maintenance');
var User = require('../app/models/user');

var should = chai.should();

var authUser;

chai.use(chaiHttp);

describe('Maintenance', function() {

	User.collection.drop();
	Bike.collection.drop();
	Maintenance.collection.drop();

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
					chai.request(server)
						.post('/api/authenticate')
						.send({'email': 'jdoe@doe.com', 'password': 'the password'})
						.end(function(err, res) {
							authUser = res.body;
							done();
						});
				});
			});

	});

	afterEach(function(done) {
		User.collection.drop();
		Bike.collection.drop();
		Maintenance.collection.drop();
		done();
	});

	it('should get an individual maintenance item /maintenance/:id GET', function(done) {	
		chai.request(server)
			.get('/api/bikes')
			.set('authorization', 'Bearer ' + authUser.token)
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/maintenance')
					.set('authorization', 'Bearer ' + authUser.token)
					.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016')})
					.end(function(err, res) {
						chai.request(server)
							.get('/api/maintenance/' + res.body.maintenance[0]._id)
							.set('authorization', 'Bearer ' + authUser.token)
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

	it('should update a maintenance item /maintenance/:id PUT', function(done) {
		// Adding a new part to the build, should I do this initially? need to figure out.
		chai.request(server)
			.get('/api/bikes')
			.set('authorization', 'Bearer ' + authUser.token)
			.end(function(err, res) {
				chai.request(server)
					.post('/api/bikes/' + res.body[0]._id + '/maintenance')
					.set('authorization', 'Bearer ' + authUser.token)
					.send({'description': 'Front Barke Bleed', 'completeddate':''})
					.end(function(err, res) {
						var bike = res.body;
						chai.request(server)
						.put('/api/maintenance/' + bike.maintenance[0]._id)
						.set('authorization', 'Bearer ' + authUser.token)
						.send({'description': 'Front Brake Bleed', 'completeddate': new Date('11/12/2016')})
						.end(function(err, res) {
							res.should.have.status(200);
							res.should.be.json;
							res.body.should.be.a('object');
							res.body.should.have.property('_id');
							res.body._id.should.equal(bike.maintenance[0]._id);
							res.body.should.have.property('description');
							res.body.description.should.equal('Front Brake Bleed');
							res.body.should.have.property('completeddate');
							res.body.completeddate.should.equal(new Date('11/12/2016').toJSON());
							done();
						});

					});
			});
	});

	it('should delete a maintenance item /maintenance/:id DELETE', function(done) {
		chai.request(server)
			.get('/api/bikes')
			.set('authorization', 'Bearer ' + authUser.token)
			.end(function(err, res) {
				var bike = res.body[0];
				chai.request(server)
					.post('/api/bikes/' + bike._id + '/maintenance')
					.set('authorization', 'Bearer ' + authUser.token)
					.send({'description': 'Rear Brake Bleed', 'completeddate':''})
					.end(function(err, res) {
						res.body.maintenance.length.should.equal(1);
						// console.log(res.body);

						chai.request(server)
							.delete('/api/maintenance/' + res.body.maintenance[0]._id)
							.set('authorization', 'Bearer ' + authUser.token)
							.end(function(err, res) {
								res.should.have.status(200);
								res.should.be.json;

								chai.request(server)
									.get('/api/bikes/' + bike._id)
									.set('authorization', 'Bearer ' + authUser.token)
									.end(function(err, res) {
										res.body.maintenance.length.should.equal(0);

										done();
									});
							});
					});
			});
	});
});