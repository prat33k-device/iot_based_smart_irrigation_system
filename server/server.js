const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require('http');
const socketIo = require('socket.io');
//models
const SensorData = require("./sensor_data");
const PumpStatus = require("./pump_status");
//credintials
const dbName = "irrigation_system_db";
const dbURL = "mongodb+srv://admin-prat33k:admin123@cluster0.4wyjr.mongodb.net/" + dbName;
const authKey = "Jqoe6UzmSPjG7E0";
const ID_OF_PUMP = "6437092f7d099b6ee1f2e8f5";
const port = process.env.PORT || 3000;
var data_frequency = 0;
var range = 13;
var serverConnected = false;
var ThreshholdSoil = 60;
var maximumSoil = 200;
var maximumTemperature = 100; //do not change
var maximumHumidity = 200;
mongoose.connect(dbURL)
.then(() => {console.log('Connected to database');serverConnected = true;})
.catch((error) => {console.error('Database connection error:', error);serverConnected = false;});


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))


//statusUpdated && lastDataSet
function waitForCondition(val) {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (val) {
          clearInterval(intervalId);
          resolve();
      }
  }, 100);
  });
}

io.on("connection", socket => {
socket.on("statusUpdated", async (data, callback) => {
    if(serverConnected){
        const pump_status = await PumpStatus.findById(ID_OF_PUMP);
        pump_status.status = data.pump ? 1 : 0;
        pump_status.is_controlled_by_user = data.auto ? 1 : 0;
        await pump_status.save();
        callback(true);
    }else{
        callback(false);
    }
});
socket.on("lastDataSet", async (rng,callback) => {
    range = rng;data_frequency = 0;
    await waitForCondition(serverConnected);
    var dataset = [];
    range = 1;//need to update here
    const allData = await SensorData.find().sort({time : -1}).limit(range*13);allData.reverse();
    for (let i = 0; i < allData.length; i += range) {
        let s = 0, t = 0, h = 0;
        let HH = allData[i].time.getHours().toString().padStart(2,0);
        let MM = allData[i].time.getMinutes().toString().padStart(2,0);
        for(let j = 0; j<range;j++){
            s+=allData[i+j].soil_moisture;
            t+=allData[i+j].temperature;
            h+=allData[i+j].humidity;
        }
        s/=range;t/=range;h/=range;
        dataset.push({
            date : HH.toString()+":"+MM.toString(),
            S : s,
            T : t,
            H : h
        });
    }
    const pump_status = await PumpStatus.findById(ID_OF_PUMP);
    let complete_data = {
        dataSet : dataset,
        status : {
            pump : pump_status.status,
            auto : pump_status.is_controlled_by_user,
        },
        edge : {
            ThS : ThreshholdSoil,
            MS : maximumSoil,
            MT : maximumTemperature,
            MH : maximumHumidity
        }
    };
    callback(complete_data);
});
});

// #######################   routes    #######################


app.get("/test", (req, res)=>{
    console.log("get request recived");
    res.sendStatus(200);
});

app.get("/sensors", async (req, res)=>{
    ThreshholdSoil = req.body.Ths;
    maximumSoil = req.body.MS;//check if exists
    maximumTemperature = req.body.MT;
    maximumHumidity = req.body.MH;
    res.sendStatus(200);
});

app.post("/update-sensor", async (req, res)=>{

    if(req.body.authKey === authKey) {
        const data = new SensorData({
            soil_moisture: req.body.soil_moisture,
            temperature: req.body.temp,
            humidity: req.body.humidity,
        });
        if(serverConnected){data.save();}
        if (data_frequency == 0){
            let data_to_be_send_frontend = {
                S : req.body.soil_moisture,
                T : req.body.temp,
                H : req.body.humidity
            };
            io.emit("newDataReceived",data_to_be_send_frontend);
        }
        data_frequency = data_frequency + 1;data_frequency = data_frequency%range;
        res.send("data recived,updated & event trigerred succesfully.");
    } else {
        res.status(401).send("Unauthorized");
    } 
});

app.get("/pump-status/:authKey", async (req, res)=>{

    if(req.params.authKey === authKey) {

        const pump_status = await PumpStatus.findById(ID_OF_PUMP)

        console.log("pump status: " + pump_status.status + " is_controlled_by_user: " + pump_status.is_controlled_by_user);

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

app.get("/",function(req,res){
    res.sendFile(__dirname+'/web/index.html');
});

server.listen(port, ()=> {
    console.log("Server is running at port "+port);
});