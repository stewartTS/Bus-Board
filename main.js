
const fetch = require('node-fetch');
const prompt = require('prompt-sync')();
const util = require('util');



const getPostcode = async () => {
    const input = prompt('Please enter a postcode: ');
    const url = `https://api.postcodes.io/postcodes/${input}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const jsonResponse = await response.json();
            const result = {
                longitude: jsonResponse.result.longitude,
                latitude: jsonResponse.result.latitude
            }
            return result;
        }
        throw new Error('Request failed for getPostcode!')
    }
    catch (error) {
        (console.log(error));
        process.exit();
    }
}

const getStopPoints = async (postcode) => {
    const radius = prompt('Please enter distance to bus stop: ')
    console.log(postcode);
    const url = `https://api.tfl.gov.uk/StopPoint/?lat=${postcode.latitude}&lon=${postcode.longitude}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const jsonResponse = await response.json();
            const result = jsonResponse;
            if (result.stopPoints.length < 2) {
                console.log("No stop points near your postcode.")
                process.exit();
            }
            return result;
        }
        throw new Error('Request failed getStopPoint!')
    }
    catch (error) {
        console.log(error)
        process.exit()
    }
}

const Closest2Stops = (body) => {
    const stops = [];

    body.stopPoints.forEach(point => {
        let stop = {};
        stop["id"] = point.id;
        stop["distance"] = Math.ceil(point.distance);
        stop["name"] = point.commonName;


        stops.push(stop);
    });
    const top2Stops = [stops[0], stops[1]];
    return top2Stops;

}

const getBuses = async (closestStops) => {

    const url = `https://api.tfl.gov.uk/StopPoint/${closestStops}/Arrivals`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const body = await response.json();
            const buses = [];
            body.forEach(bus => {
                let coach = {};
                coach["lineID"] = bus.lineId;
                coach["destinationName"] = bus.destinationName;
                coach["timeToStation"] = Math.ceil((bus.timeToStation) / 60);

                buses.push(coach);
            })
            const sortedBuses = buses.sort(coach = (a, b) => { return (a['timeToStation'] - b['timeToStation']) });

            return sortedBuses.slice(0, 5);
        }
        throw new Error("Request failed getBuses!")

    } catch (error) {
        console.log(error);
        process.exit();
    }
}

const runGetBusesTwice = async (closestStops) => {
    const result = [
        [closestStops[0].name],
        [closestStops[1].name]

    ];


    const bus1 = await getBuses(closestStops[0].id);
    const bus2 = await getBuses(closestStops[1].id);
    result[0].push(bus1);
    result[1].push(bus2);
    console.log(util.inspect(result, { showHidden: false, depth: null }));

    return result;

}

const journeyPlanner = async (destination, postcode) => {
    const result = [];
    const url = `https://api.tfl.gov.uk/Journey/JourneyResults/${postcode.latitude},${postcode.longitude}/to/${destination}`
    try {
        const response = await fetch(url)
        if (response.ok) {
            const jsonResponse = await response.json();
            jsonResponse.journeys.forEach(journey => {
                journey.legs[0].instruction.steps.forEach(step => {
                    let line = step.descriptionHeading + " " + step.description;
                    result.push(line);
                })
            })

            return result;
        }
        throw new Error('Request destination failed')
    }
    catch (error) {
        console.log(error);
        process.exit();
    }
}

const runJourneyPlannerTwice = async (closestStops, postcode) => {
    const results = [];

    const journey1 = await journeyPlanner(closestStops[0].id, postcode);
    const journey2 = await journeyPlanner(closestStops[1].id, postcode);

    results.push([closestStops[0].name, journey1]);
    results.push([closestStops[1].name, journey2]);

    console.log(results);
    return results

}

async function main() {
    let postcode = await getPostcode();

    const stopPoints = await getStopPoints(postcode);
    const topStops = Closest2Stops(stopPoints);
    const buses = await runGetBusesTwice(topStops);

    const directionsOn = prompt('Do you also wish for directions? y/n ')

    if (directionsOn == "y") {
        const journey = await runJourneyPlannerTwice(topStops, postcode);
    }
}
main();
