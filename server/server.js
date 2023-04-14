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
const ID_OF_PUMP = "6437092f7d099b6ee1f2e8f5";
mongoose.connect(dbURL);


const app = express();
app.use(bodyParser.urlencoded({extended: true}));

// #######################   routes    #######################


app.get("/test", (req, res)=>{
    console.log("get request recived");
    res.sendStatus(200);
});

app.post("/update-sensor", async (req, res)=>{

    console.log(req.body);
    
    const data = new SensorData({
        soil_moisture: req.body.soil_moisture,
        temperature: req.body.temp,
        humidity: req.body.humidity
    });

    console.log(data);

    // await data.save();

    res.send("data fuckin recived");
});

app.get("/pump-status/:authKey", async (req, res)=>{

    if(req.params.authKey === authKey) {

        const pump_status = await PumpStatus.findById(ID_OF_PUMP)

        console.log("pump status: " + pump_status.status + " is_controlled_by_user: " + pump_status.is_controlled_by_user);

        // if(pump_status.status === 0 && pump_status.is_controlled_by_user == 0) {
        //     res.send("statusOFF-is_controlled_by_user0");
        // } else if(pump_status.status === 0 && pump_status.is_controlled_by_user == 1) {
        //     res.send("statusOFF-is_controlled_by_user1");
        // } else if(pump_status.status === 1 && pump_status.is_controlled_by_user == 0) {
        //     res.send("statusON-is_controlled_by_user0");
        // } else if(pump_status.status === 1 && pump_status.is_controlled_by_user == 1) {
        //     res.send("statusON-is_controlled_by_user1");
        // } else {
        //     res.send("-1");
        // }

        res.json({
            pump_status: pump_status.status,
            is_controlled_by_user: pump_status.is_controlled_by_user
        });
    

    } else {
        res.status(401).send("Unauthorized");
    }

});

app.post("/set-pump-status", async (req, res)=> {

    if(req.body.authKey === authKey) {

        const pump_status = await PumpStatus.findById(ID_OF_PUMP);
        pump_status.status = Number(req.body.newStatus);
        pump_status.last_updated_time = new Date();
        await pump_status.save();
        console.log("pump status updated succesfully");
        res.sendStatus(200);

    } else {
        res.status(401).send("Unauthorized");
    }

});

app.post("/set-is-controlled-by-user", async (req, res)=> {

    if(req.body.authKey === authKey) {

        const is_controlled = await PumpStatus.findById(ID_OF_PUMP);
        is_controlled.is_controlled_by_user = Number(req.body.newIsControlled);
        await is_controlled.save();
        console.log("is_controlled_by_user is successfully updated");
        res.sendStatus(200);

    } else {
        res.status(401).send("Unauthorized");
    }

});

app.listen(3000, ()=> {
    console.log("Server is running at port 3000");
});