process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');

var User = require('../app/models/user');

var should = chai.should();

chai.use(chaiHttp);

describe('Users', function() {

	User.collection.drop();

	beforeEach(function(done) {
		// When worrying about user, will need to add a new user here... and use through out tests.
		var newUser = new User({
			name: 'John Doe',
			email: 'jdoe@doe.com',
			password: 'the password'
		});
		
		newUser.save(function(err, data) {
			done();
		})

	});

	afterEach(function(done) {
		User.collection.drop();
		done();
	});
	
	it('should authenticate a user POST', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				res.should.have.status(200);	
				res.should.json;
				res.should.be.a('object');
				res.body.message.should.equal('Authentication successful');
				res.body.should.have.property('token');
				res.body.token.should.not.be.empty;
				res.body.should.have.property('user');
				res.body.user.name.should.equal('John Doe');
				res.body.user.email.should.equal('jdoe@doe.com');
				res.body.user.should.have.property('_id');
				res.body.user.should.not.have.property('password');
				done();
			});
	});
	
	it('should throw 400 when username not found', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'janedoe212@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				res.should.have.status(400);	
				res.should.json;
				res.should.be.a('object');
				res.body.message.should.equal('user not found');
				done();
			});
	});
	
	it('should throw 400 when password incorrect', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password is wrong!'})
			.end(function(err, res) {
				res.should.have.status(400);	
				res.should.json;
				res.should.be.a('object');
				res.body.message.should.equal('password incorrect');
				done();
			});
	});

	it('should get all users /users GET', function(done) {
		chai.request(server)
			.post('/api/authenticate')
			.send({'email': 'jdoe@doe.com', 'password': 'the password'})
			.end(function(err, res) {
				var token = res.body.token;
				
				chai.request(server)
					.get('/api/users')
					.set('x-access-token', token)
					.end(function(err, res) {
						res.should.have.status(200);
						res.should.be.json;
						res.body.should.be.a('array');
						res.body.length.should.equal(1);
						res.body[0].should.have.property('_id');
						res.body[0].should.have.property('name');
						res.body[0].name.should.equal('John Doe');
						res.body[0].should.have.property('email');
						res.body[0].email.should.equal('jdoe@doe.com');
						res.body[0].should.not.have.property('password');
						done();
					});
			});
			
	});
	
	it('should add a new user /users POST', function(done) {
		chai.request(server)
			.post('/api/users')
			.send({'name': 'Jane Doe', 'email': 'jane.doe@doe.com', 'password': 'another password'})
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object')
				res.body.should.have.property('_id');
				res.body.should.have.property('name');
				res.body.name.should.equal('Jane Doe');
				res.body.should.have.property('email');
				res.body.email.should.equal('jane.doe@doe.com');
				res.body.should.not.have.property('password');
				done();
			});
	});
});