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

        console.log("pump status: " + pump_status.status);

        if(pump_status.status === 0) {
            res.send("OFF");
        } else if(pump_status.status === 1) {
            res.send("ON");
        } else {
            res.send("-1");
        }
    

    } else {
        res.status(401).send("Unauthorized");
    }

});

app.post("/set-pump-status", async (req, res)=> {

    if(req.body.authKey === authKey) {

        const pump_status = await PumpStatus.findById(id_of_pump);
        pump_status.status = req.body.newStatus;
        await pump_status.save();
        console.log("pump status updated succesfully");
        res.sendStatus(200);

    } else {
        res.status(401).send("Unauthorized");
    }

});

app.listen(3000, ()=> {
    console.log("Server is running at port 3000");
});