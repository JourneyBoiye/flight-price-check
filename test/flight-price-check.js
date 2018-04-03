const assert = require('assert');
const nock = require('nock');

import { getAvgFlightPrice, concurrentFlightAverages }
  from '../actions/flight-price-check.js';

describe('flight-price-check', function() {
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
      })
      .get('?currency=usd&period_type=year&origin=US&destination=ES&page1' +
           '&limit=100&show_to_affiliates=true&token=1')
      .replyWithFile(200, __dirname + '/fixtures/us-es.json', {
        'Content-Type': 'application/json'
      });
  });

  it('should give two averages when providing more than one location', function(done) {
    concurrentFlightAverages('1', 'US', ['FR','ES']).then((resp) => {
      for (let result of resp.avgs) {
        assert(result.success, true);
      }

      done();
    });
  });

  it('should give one average and one error', function(done) {
    concurrentFlightAverages('1', 'US', ['FR', 'adfa']).then((resp) => {
      assert.equal(resp.avgs[0].success, true);
      assert.equal(resp.avgs[1].success, false);

      done();
    });
  });

  it('should return an error when IATA code is invalid', function(done) {
    getAvgFlightPrice('1', 'US', 'adfa').then((resp) => {
      assert.equal(resp.success, false);

      done();
    });
  });
  it('should return an average fare, number of flights in average, and success',
    function(done) {
      getAvgFlightPrice('1', 'US', 'FR').then((resp) => {
        assert.notEqual(resp.avg, 0);
        assert.notEqual(resp.size, 0);
        assert.equal(resp.success, true);

        done();
      });
    }
  );
  it('should return no average fare, and success when no flight data',
    function(done) {
      getAvgFlightPrice('1', 'MW', 'KN').then((resp) => {
        assert.equal(resp.avg, 0);
        assert.equal(resp.size, 0);
        assert.equal(resp.success, true);

        done();
      });
    }
  );
});
