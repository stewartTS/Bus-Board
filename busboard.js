
const fetch = require('node-fetch');
const prompt = require('prompt-sync')();

//const stopType = NaptanPublicBusCoachTram

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

async function getPostcode(){
    const postcode = prompt('Please enter your postcode: ');

    const coordinated = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(response => response.json())
    .then(body => {
        const longitude= body.result.longitude;
        const latitude = body.result.latitude;
        console.log(longitude, latitude);
    });
} 

getPostcode();
//run()
