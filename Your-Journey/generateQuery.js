
function generateQuery(userInput, options) {
    let { travelMode, tripType, stayType, companionType, restaurantType } = options;

    let query = userInput + ". Give output as an HTML document without CSS. Make it Detailed and include suggestions for places to visit. ";

    if (companionType !== "") {
        companionType = "a " + companionType;
    } else {
        companionType = "the";
    }

    if (stayType !== "" || companionType !== "") {
        query += "Provide suggestions for the best " + stayType + " stay in the area for " + companionType + " trip. ";
    }

    if (tripType !== "") {
        if (tripType === "Budget") {
            query += "Travel involves traveling on a tight budget and finding ways to save money on transportation, lodging, food, and activities. ";
        } else if (tripType === "Backpacking") {
            query += "Assume traveling with just a backpack and staying in hostels or camping. ";
        } else if (tripType === "Luxury Travel") {
            query += "Assume traveling involves staying in high-end hotels, eating at fancy restaurants, and enjoying exclusive experiences. ";
        }
    }

    if (travelMode !== "") {
        query += "Also give a suggestion for arriving there by " + travelMode + ". ";
    }

    if (restaurantType !== "") {
        if (restaurantType === "Home") {
            restaurantType = "Home-cooked meals";
        }
        query += "And find " + restaurantType + " nearby.";
    }

    return query;
}

module.exports = generateQuery;
