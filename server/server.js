const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//models
const SensorData = require("./sensor_data");
const PumpStatus = require("./pump_status");
//credintials
const dbName = "irrigation_system_db";
const dbURL = "mongodb+srv://admin-prat33k:admin123@cluster0.4wyjr.mongodb.net/" + dbName;
const authKey = "Jqoe6UzmSPjG7E0";
const id_of_pump = "6435037afc098bd383efab6b";
mongoose.connect(dbURL);


const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// routes


app.get("/test", (req, res)=>{
    console.log("get request recived");
    res.sendStatus(200);
});

app.post("/update-sensor", async (req, res)=>{

    console.log(req.body);
    
    // const data = new SensorData({
    //     name: "sensor-xyz",
    //     sensor_number: req.body.sensor_value
    // });

    // await data.save();

    res.send("data fuckin recived");
});

app.get("/pump-status/:authKey", async (req, res)=>{

    if(req.params.authKey === authKey) {

        const pump_status = await PumpStatus.findById(id_of_pump)

        console.log(pump_status);

        res.send(pump_status.status);

    } else {
        res.status.send("Unauthorized");
    }

});

app.post("/set-pump-status", async (req, res)=> {
    
});

app.listen(3000, ()=> {
    console.log("Server is running at port 3000");
});