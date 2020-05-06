let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let config = require('config');

chai.use(chaiHttp);

describe('dashboard', () => {

	describe('/POST dashboard ID', () => {

		it('Dashboard should be reachable.', (done) => {

			chai.request(server)
				.get('/nokia/dashboard/UserId')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(404);
	            		res.body.should.be.a('object');
	            		done();

	            });

		});

	});

	describe('/POST dashboard ID + ACTION', () => {

		it('Dashboard should be reachable.', (done) => {

			chai.request(server)
				.get('/nokia/dashboard/UserId/Action')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(404);
	            		res.body.should.be.a('object');
	            		done();

	            });

		});

	});

	describe('/POST dashboard ID + ACTION + DATE', () => {

		it('Dashboard should be reachable.', (done) => {

			chai.request(server)
				.get('/nokia/dashboard/UserId/Action/Date')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(404);
	            		res.body.should.be.a('object');
	            		done();

	            });

		});

	});

	describe('/POST dashboard ID + ACTION + STARTDATE + ENDDATE', () => {

		it('Dashboard should be reachable.', (done) => {

			chai.request(server)
				.get('/nokia/dashboard/UserId/Action/StartDate/EndDate')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(404);
	            		res.body.should.be.a('object');
	            		done();

	            });

		});

	});

});
