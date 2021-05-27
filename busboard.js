//stop code = naptahnID
//lineID, expected arrival

//https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals HTTP/1.1
//?app_key=28d983ba6f7e4db08abcab4117bafc35
const fetch = require('node-fetch');
const prompt = require('prompt-sync')();



async function run() {
    let id = prompt(console.log("Please enter the stop code"));    

    const arrivalPrediction = await fetch(`https://api.tfl.gov.uk/StopPoint/${id}/Arrivals`)
        .then(response => response.json()) 
        .then(body => {
            const buses = [];
            body.forEach(bus => {
                let coach = {};
                coach["lineID"] = bus.lineId;
                coach["destinationName"] = bus.destinationName;
                coach["timeToStation"] = Math.ceil((bus.timeToStation) / 60);
                //console.log(coach);

                buses.push(coach);
            })
            const sortedBuses = buses.sort(coach = (a,b)=>{return (a['timeToStation']-b['timeToStation'])});
            //console.log(buses);
            console.log(sortedBuses.slice(4));
        })

       
        
}
run()
/*



function toJson(response) {
    return response.json()
}

async function run() {
    const input = prompt("What postcode would you like to search for?  ")

    const output = await fetch(``https://api.tfl.gov.uk/StopPoint/${id}/Arrivals``)
        .then(toJson)
        .catch(err => console.log(err))
        .finally(_ => console.log("Done"));

    console.log(output)
}

run()
*/