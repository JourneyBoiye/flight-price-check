const assert = require('assert');
const nock = require('nock');

const flightPriceCheck = require('../actions/flight-price-check.js');

describe('flight-price-check', function() {
  // This setup is quite confusing. It could be simplified.
  before('define the mocking web server', () => {
    nock('http://api.travelpayouts.com/v2/prices/latest')
      .persist()
      .get('?currency=usd&period_type=year&origin=US&destination=FR&page1' +
           '&limit=100&show_to_affiliates=true&token=1')
      .replyWithFile(200, __dirname + '/fixtures/us-fr.json', {
        'Content-Type': 'application/json'
      })
      .get('?currency=usd&period_type=year&origin=US&destination=adfa&page1' +
           '&limit=100&show_to_affiliates=true&token=1')
      .replyWithFile(200, __dirname + '/fixtures/us-adfa.json', {
        'Content-Type': 'application/json'
      })
      .get('?currency=usd&period_type=year&origin=MW&destination=KN&page1' +
           '&limit=100&show_to_affiliates=true&token=1')
      .replyWithFile(200, __dirname + '/fixtures/mw-kn.json', {
        'Content-Type': 'application/json'
      });
  });

  it('should return an error when IATA code is invalid', function(done) {
    flightPriceCheck('1', 'US', 'adfa').then((resp) => {
      assert.equal(resp.success, false);

      done();
    });
  });
  it('should return an average fare, number of flights in average, and success',
    function(done) {
      flightPriceCheck('1', 'US', 'FR').then((resp) => {
        assert.notEqual(resp.avg, 0);
        assert.notEqual(resp.size, 0);
        assert.equal(resp.success, true);

        done();
      });
    }
  );
  it('should return no average fare, and success when no flight data',
    function(done) {
      flightPriceCheck('1', 'MW', 'KN').then((resp) => {
        assert.equal(resp.avg, 0);
        assert.equal(resp.size, 0);
        assert.equal(resp.success, true);

        done();
      });
    }
  );
});
