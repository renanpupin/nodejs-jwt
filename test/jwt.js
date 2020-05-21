process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

const server = require('../index.js');

const timestamp = new Date().getTime();

describe('test schedule', () => {

    const jwtInvalid = "a1b2c3";
    let jwtToken;
    let refreshToken;

    it('should test API', function (done) {
        chai.request(server)
            .get('/')
            .end(function (err, res) {
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                done();
            });
    });

    it('should signup', function (done) {
        chai.request(server)
            .post('/api/signup')
            .send({
                email: 'email'+timestamp+'@test.com',
                password: '123456'
            })
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);

                done();
            });
    });

    it('should signin', function (done) {
        chai.request(server)
            .post('/api/signin')
            .send({
                email: 'email'+timestamp+'@test.com',
                password: '123456'
            })
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);
                expect(res.body.jwt).to.not.be.undefined;
                expect(res.body.refreshToken).to.not.be.undefined;

                jwtToken = res.body.jwt;
                refreshToken = res.body.refreshToken;

                done();
            });
    });

    it('should test protected route with NO token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .end(function(err, res){
                console.log(err, res.status, res.body);

                expect(res.status).to.eql(401);
                expect(res.body.success).to.eql(false);
                expect(res.body.reauth).to.eql(false);

                done();
            });
    });

    it('should test protected route with INVALID token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .set('Authorization', 'JWT '+jwtInvalid)
            .end(function(err, res){
                console.log(err, res.status, res.body);

                expect(res.status).to.eql(401);
                expect(res.body.success).to.eql(false);
                expect(res.body.reauth).to.eql(false);

                done();
            });
    });

    it('should test protected route with VALID token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .set('Authorization', 'JWT '+jwtToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);

                done();
            });
    });

    it('should wait time to token expire', function (done) {
        setTimeout(() => {
            done();
        }, 3000);
    });

    it('should test protected route with EXPIRED token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .set('Authorization', 'JWT '+jwtToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(401);
                expect(res.body.success).to.eql(false);
                expect(res.body.reauth).to.eql(false);

                done();
            });
    });

    it('should regenerate token', function (done) {
        chai.request(server)
            .post('/api/regenerate')
            .set('Authorization', 'JWT '+refreshToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);

                jwtToken = res.body.jwt;

                done();
            });
    });

    it('should wait time to refresh token expire', function (done) {
        setTimeout(() => {
            done();
        }, 3000);
    });

    it('should FAIL to regenerate due expired refresh token', function (done) {
        chai.request(server)
            .post('/api/regenerate')
            .set('Authorization', 'JWT '+refreshToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(401);
                expect(res.body.success).to.eql(false);
                expect(res.body.reauth).to.eql(false);

                //NOTE: on client, user should authenticate again

                done();
            });
    });

    it('should signin again to update valid tokens', function (done) {
        chai.request(server)
            .post('/api/signin')
            .send({
                email: 'email'+timestamp+'@test.com',
                password: '123456'
            })
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);
                expect(res.body.jwt).to.not.be.undefined;

                jwtToken = res.body.jwt;
                refreshToken = res.body.refreshToken;

                done();
            });
    });

    it('should test protected route with VALID token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .set('Authorization', 'JWT '+jwtToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);

                done();
            });
    });

    it('should invalidate regenerate token', function (done) {
        chai.request(server)
            .post('/api/revoke')
            .set('Authorization', 'JWT '+jwtToken)
            .send({
                token: refreshToken
            })
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(200);
                expect(res.body.success).to.eql(true);

                done();
            });
    });

    it('should test protected route with REVOKED token', function (done) {
        chai.request(server)
            .get('/api/protected')
            .set('Authorization', 'JWT '+jwtToken)
            .end(function(err, res){
                console.log(err, res.body);

                expect(res.status).to.eql(401);
                expect(res.body.success).to.eql(false);
                expect(res.body.reauth).to.eql(true);

                done();
            });
    });
});
