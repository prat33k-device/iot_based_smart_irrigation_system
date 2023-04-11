const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//models
const SensorData = require("./sensor_data");
const PumpStatus = require("./pump_status");
//credintials
const dbName = "irrigation_system_db";
const dbURL = "mongodb+srv://admin-prat33k:admin123@cluster0.4wyjr.mongodb.net/" + dbName;
mongoose.connect(dbURL);


const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// routes


app.get("/test", (req, res)=>{
    console.log("get request recived");
    res.sendStatus(200);
});

app.post("/sensor", async (req, res)=>{

    console.log(req.body);
    
    // const data = new SensorData({
    //     name: "sensor-xyz",
    //     sensor_number: req.body.sensor_value
    // });

    // await data.save();

    res.send("data fuckin recived");
});

app.listen(3000, ()=> {
    console.log("Server is running at port 3000");
});