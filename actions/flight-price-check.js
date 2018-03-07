const assert = require('assert');
const fetch = require('node-fetch');

//import fetch from 'node-fetch';

/*
 * Gets the average flight price between two countries via the Travel Payouts
 * API.
 *
 * Args:
 *  token: The API token to use in constructing the URL.
 *  from: The IATA country code of departure.
 *  to: The IATA country of arrival.
 *
 * Returns:
 *  A promise that resolves to the desired result with an avg field, a size
 *  field, and a success field.
 */
function getAvgFlightPrice(token, from, to) {
  const TRAVEL_PAYOUTS_URL =
    'http://api.travelpayouts.com/v2/prices/latest?currency=usd&' + 
    'period_type=year&origin=' + from + '&destination=' + to +
    '&page1&limit=100&show_to_affiliates=true&token=' + token;

  return new Promise((resolve, reject) => {
    // Create a promise that resolves with the text of the body from the
    // requested URL.
    let body = fetch(TRAVEL_PAYOUTS_URL)
      .then(res => res.text())
      .then(body => body);

    // On getting the response from the flight API, calculate the average flight
    // price and return the size as well. If no flights returned then average is
    // 0. If there is an error, the error flag is set.
    body.then(function(text) {
      var resp = JSON.parse(text);
      var size = 0;
      var avg = 0;
      var success = true;

      if ('data' in resp) {
        success = success && resp.success;

        var flights = resp.data;
        var sum = 0;
        size = flights.length;

        for (let flight of flights) {
          sum += flight.value;
        }

        if (flights.length > 0) {
          avg = sum / flights.length;
        }
      } else {
        success = false;
      }

      resolve({
        'avg': avg,
        'size': size,
        'success': success
      });
    });
  });
}


/*
 * This function finds the average price for flights between two countries
 * provided by their IATA codes. The data is limited to that of travel payouts.
 * This data is limited and so cities could not be used, and countries instead
 * were used with the average being returned.
 */
function main(params) {
  assert(params, 'params cannot be null');
  assert(params.travelPayoutsToken, 'params.travelPayoutsToken cannot be null');
  assert(params.iataFrom, 'params.iataFrom cannot be null');
  assert(params.iataTo, 'params.iataTo cannot be null');

  var travelPayoutsToken = params.travelPayoutsToken;
  var iataFrom = params.iataFrom;
  var iataTo = params.iataTo;

  return getAvgFlightPrice(travelPayoutsToken, iataFrom, iataTo);
}

global.main = main;
module.exports = getAvgFlightPrice;
