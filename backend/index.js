
const parseString = require('xml2js').parseString
const axios = require('axios')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

let pilots = 
[
  /*{
    "name": "testpilot",
	"distance": "0",
	"email": "test@test.fi",
    "phone": "00000000"
  }*/
] 
let timers = 
[
  /*{
    "name": "testpilot",
	"timeout": setTimeout() object
  }*/
]

function GetDroneData() {
  axios
    .get("http://assignments.reaktor.com/birdnest/drones")
    .then(response => {
	  //console.log("response.data:", response.data)
	  parseString(response.data, (foo, results) => {
  	    let data = JSON.stringify(results)
	    data = JSON.parse(data)
	    const capture = data.report.capture
	    //console.log("results:",capture[0])
	    capture[0].drone.forEach(drone => {
		  const serial = drone.serialNumber;
		  const y = drone.positionY
		  //console.log("distanceY:", y)
		  const x = drone.positionX
		  //console.log("distanceX:", x)
		  let distance = Math.sqrt(Math.pow(250000-x,2)+Math.pow(250000-y,2));
		  //console.log("distance:", distance, "serial number:",serial[0])
		  if (distance < 100000) {
		    console.log("ILLEGAL DISTANCE !%&/!")
		    GetPilotData(distance, serial[0])
		  }
	    },)
      })
    })
}

function GetPilotData(distance, serial) {
	//console.log("Trying to get pilot data")
	axios
      .get(`http://assignments.reaktor.com/birdnest/pilots/${serial}`)
      .then(response => {
	    const pilot = response.data
		//console.log("pilot", pilot)
		const wholename = `${pilot.firstName} ${pilot.lastName}`
		const newpilot = {
		  "name": wholename,
		  "distance": `${distance}`,
		  "email": `${pilot.email}`,
		  "phone": `${pilot.phoneNumber}`
		}
		UpdatePilot(newpilot)
	  })
	  .catch(error => {
		  console.log("Pilot info not found")
	  })
}

function UpdatePilot(newpilot) {
	let finding = pilots.find(pilot => pilot.name === newpilot.name)
	if ( finding !== undefined) {
	  const time = timers.find(timer => timer.name === finding.name)
	  clearTimeout(time)
	  timers = timers.filter(timer => timer.name !== finding.name)
	  if (newpilot.distance < finding.distance ) {
	    pilots = pilots.filter(pilot => pilot.name !== newpilot.name)
		pilots = pilots.concat(newpilot)
	  }
	}
	else {
	  pilots = pilots.concat(newpilot)
	}
	const newtimer = {
	  "name": newpilot.name,
	  "timeout": setTimeout(RemovePilot, 600000, newpilot.name)
	}
	timers = timers.concat(newtimer)
}

function RemovePilot(oldpilotname) {
  pilots = pilots.filter(pilot => pilot.name !== oldpilotname)
  timers = timers.filter(timer => timer.name !== oldpilotname)
} 

setInterval( GetDroneData, 2000)

app.get('/pilots', (req, res) => {
	res.send(pilots)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
