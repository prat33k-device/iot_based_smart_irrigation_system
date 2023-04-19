const socket = io();

function buildChart(range,callback){
    //update chart and threshold and max values.and pump and auto data
    socket.emit("lastDataSet",range,(Data121) => {
        Last121SensorDataReceived = false;
        if ((typeof Data121) == "object"){
            status.pump = Data121.status.pump;
            status.auto = Data121.status.auto;
            ThS = Data121.edge.ThS;
            MS = Data121.edge.MS;
            MT = Data121.edge.MT;
            MH = Data121.edge.MH;
            buildNewChart(Data121.dataSet,() => {
                callback(true);
                Last121SensorDataReceived = true;
            });
        }
    });
}
socket.on("connect", () => {
    buildChart(13,(res) => {
        if(res){socket.on("newDataReceived",(data) => updateNewChart(data));}
    });
    
});
function sendNewStatus(P,A,callback){
    socket.emit("statusUpdated", { pump:P,auto:A }, (response) => {
        if(response){
            callback({
                pump: P,
                auto: A
            });
        }else{
            console.log("error in sendNewStatus, try after some time"); 
        }
    });
}
function launchComplete(){

    $("#Pump").on("click touchend", () => {
        try {
            sendNewStatus(!status.pump,status.auto,(data) => {
                status.pump = data.pump
            });
        }catch(error){}
    });
    $("#Auto").on("click touchend", () => {
        try{
            sendNewStatus(status.pump,!status.auto,(data) => {
                status.auto = data.auto
            });   
        }catch(error){}
    });
    $("#Range_input").on("change",() => {
        try{
            buildChart($("#Range_input").val(),()=>{});   
        }catch(error){}
    });
}
$(document).ready(launchComplete);