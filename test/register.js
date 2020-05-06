let chai = require('chai');
let server = require('../app');
const config = require('config');
let should = chai.should();
let expect = chai.expect;

chai.use(require('chai-http'));

describe('register', () => {

	describe('/GET register (reachable)', () => {

		it('Register should be reachable.', (done) => {

			chai.request(server)
				.get('/nokia/register/UserId')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		done();

	            });

		});

	});

	describe('/GET register (returns url)', () => {

		it('Register should return a url.', (done) => {

			chai.request(server)
				.get('/nokia/register/UserId')
				.auth(config.get("credentials.USERNAME"), config.get("credentials.PASSWORD"))
	            .end((err, res) => {

	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		expect(res.text).to.contain('href');
	            		done();

	            });

		});

	});

});
