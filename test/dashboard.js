let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('dashboard', () => {
	
	describe('/POST dashboard ID', () => {
	
		it('Dashboard should be reachable.', (done) => {
			
			chai.request(server)
				.post('/dashboard/UserId')
	            .end((err, res) => {
	            	
	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		done();
	            
	            });
	      
		});
	
	});
	
	describe('/POST dashboard ID + ACTION', () => {
		
		it('Dashboard should be reachable.', (done) => {
			
			chai.request(server)
				.post('/dashboard/UserId/Action')
	            .end((err, res) => {
	            	
	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		done();
	            
	            });
	      
		});
	
	});
	
	describe('/POST dashboard ID + ACTION + DATE', () => {
		
		it('Dashboard should be reachable.', (done) => {
			
			chai.request(server)
				.post('/dashboard/UserId/Action/Date')
	            .end((err, res) => {
	            	
	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		done();
	            
	            });
	      
		});
	
	});
	
	describe('/POST dashboard ID + ACTION + STARTDATE + ENDDATE', () => {
		
		it('Dashboard should be reachable.', (done) => {
			
			chai.request(server)
				.post('/dashboard/UserId/Action/StartDate/EndDate')
	            .end((err, res) => {
	            	
	            		res.should.have.status(200);
	            		res.body.should.be.a('object');
	            		done();
	            
	            });
	      
		});
	
	});

});