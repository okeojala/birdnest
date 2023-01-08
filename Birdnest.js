//import './App.css';
import React, { useState} from "react";
import axios from 'axios';


const Birdnest = () =>  {
  const [ pilots, setPilots ] = useState( 
    [
      {
	    "name": "testpilot",
	    "distance": "0",
	    "email": "test@test.fi",
	    "phone": "00000000"
	  }
    ])
	
  function Pilots(props) {
    return (
      <div>
        <h1>Drone pilots violating the Monadikuikka NDZ in last 10 minutes</h1>
	      <ul>
		    {pilots.map(pilot => {
		      return (
			    <li>{pilot.name}, {pilot.email}, {pilot.phone}, Distance: {Math.round(pilot.distance / 1000)}m</li>
		      )}
	        )}
	      </ul>
	  </div>
    )
  }
	
  axios
	.get("/pilots")
    .then(response => {
      setPilots(response.data)
	})
	.catch(error => {
	  console.log("ERROR")
	})
	  
  return (
    <div className="App">
	  <Pilots pilotdata={pilots} />
    </div>
  )
}

export default Birdnest;
