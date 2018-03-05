source .env

TRAVEL_PAYOUTS_TOKEN=`jq .travelpayouts[].credentials.token credentials.json`

# Build
npm run build

# Create Actions
echo "Creating Cloud Function Actions..."
export PACKAGE="flights"
bx wsk package create flights
bx wsk action create $PACKAGE/flight-price-check dist/bundle.js --web true --kind nodejs:8

echo "Setting default parameters..."
bx wsk action update $PACKAGE/flight-price-check \
    --param travelPayoutsToken $TRAVEL_PAYOUTS_TOKEN

echo "Retrieving Action URL..."
API_URL=`bx wsk action get $PACKAGE/flight-price-check --url | sed -n '2p'`;
API_URL+=".json"

# Write API Url to .env file
head -n 4 .env | cat >> .env_tmp; mv .env_tmp .env
echo "FUNCTION_URL=$API_URL" >> .env
