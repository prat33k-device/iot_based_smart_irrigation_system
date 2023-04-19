var ThS = 20;
var MS = 100;
var MT = 100;
var MH = 100;
var Last121SensorDataReceived = false;
var Lbls = Array.from({length: 121}, (_, index) => 120-index);
const status = {
  motor : false,
  automatic : false,
  get auto(){
    return this.automatic
  },
  set auto(val){
    if ($("#Auto").hasClass("btn-outline-primary")){$("#Auto").removeClass("btn-outline-primary");}
    if ($("#Auto").hasClass("btn-primary")) {$("#Auto").removeClass("btn-primary");}
    if (val==true){
      $("#Auto").addClass("btn-primary");
    }else{
      $("#Auto").addClass("btn-outline-primary");
    }
    this.automatic = val
  },
  get pump(){
    return this.motor
  },
  set pump(val){
    if ($("#Pump").hasClass("btn-outline-primary")) {$("#Pump").removeClass("btn-outline-primary");}
    if ($("#Pump").hasClass("btn-primary")) {$("#Pump").removeClass("btn-primary");}
    if (val==true){
      $("#Pump").addClass("btn-primary");
    }else{
      $("#Pump").addClass("btn-outline-primary");
    }
    this.motor = val
  }
}//status(.pump/.auto)

//ConvertTo100 - working
function convertSIn100(val){
  return Math.floor((val/MS)*100);
}
function convertTIn100(val){
  return Math.floor((val/MT)*100);
}
function convertHIn100(val){
  return Math.floor((val/MH)*100);
}

//need to verify
function ConvertDateToHHMM(time){
  if (typeof time == "string" && time.length == 5){
    return time;
  }else{
    let x = 16;//Sun Apr 16 2023 01:17:39 GMT+0530 (India Standard Time)
    return time.substring(x,x+5);
  }
}

//work in progress
function createLabels(arr){
  var labels = [];
  for (let i = 0; i < arr.length; i++) {
    if (i%2 == 0){
      if (typeof arr == 'object' && Number.isInteger(arr[i])) {
        labels.push(arr[i].toString());
      } else {
        //need to verify
        labels.push(ConvertDateToHHMM(arr[i]));
      }
    }else{
      labels.push("");
    } 
  }
  return labels;
}

//Complete - working
function ThSDataSet(){
  return {
    label: 'ThreshHold Soil Moisture',
    data: Array.from({length: 121}, () => convertSIn100(ThS)),
    fill: false,
    borderColor: 'rgb(51, 255, 255)',
    borderDash: [10,5]
  }
}
function SDataSet(arr){
  return {
    label: 'Soil Moisture',
    data: Array.from(arr, S => convertSIn100(S)),
    fill: false,
    borderColor: 'rgb(0, 204, 204)',
    tension: 0.2
  }
}
function TDataSet(arr){
  return {
    label: 'Temperature',
    data: Array.from(arr, T => convertTIn100(T)),
    fill: false,
    borderColor: 'rgb(204, 0, 0)',
    tension: 0.2
  }
}
function HDataSet(arr){
  return {
    label: 'Humidity',
    data: Array.from(arr, H => convertHIn100(H)),
    fill: false,
    borderColor: 'rgb(0, 0, 204)',
    tension: 0.2
  }
}

var defaultData = {
  labels: createLabels(Lbls),
  datasets: [
    ThSDataSet(),
    // SDataSet(Array.from({ length: 121 }, () => Math.floor(10+Math.random() * 50))),
    // TDataSet(Array.from({ length: 121 }, () => Math.floor(10+Math.random() * 50))),
    // HDataSet(Array.from({ length: 121 }, () => Math.floor(10+Math.random() * 50))),
    ],
};

var ctx = document.getElementById("myChart");//.getContext('2d');
const config = {
  type: 'line',
  data: defaultData,
  options: {
    radius : 0,
    plugins: {
      title: {
        display: true,
        text: 'Sensor Data Received From The Field'
      },
      legend: {
        display: true,
        position: 'right'
      }
    },
    scales: {
      x:{
        title: {
          display: true,
          text: 'Time'
        },
      },
      y:{
        title: {
          display: true,
          text: 'Sensor Data (Per 100)'
        },
        min: 0,
        max: 100,
      }
    },
  }
};

var chart = new Chart(ctx,config);

function updateNewChart(data) {
  // console.log(data);
  if (Last121SensorDataReceived){
    Lbls.shift();
    Lbls.push(Date());
    chart.data.labels = createLabels(Lbls);
    chart.data.datasets[1].data.shift();
    chart.data.datasets[1].data.push(data.S);
    chart.data.datasets[2].data.shift();
    chart.data.datasets[2].data.push(data.T);
    chart.data.datasets[3].data.shift();
    chart.data.datasets[3].data.push(data.H);
    // Update chart
    chart.update();
  }
}

function buildNewChart(dataSets,callback){
  if (Array.isArray(dataSets)){
    let arrS = [];
    let arrT = [];
    let arrH = [];
    Lbls = [];
    for (let i = 0; i < dataSets.length; i++){
      Lbls.push(dataSets[i].date);
      arrS.push(dataSets[i].S);
      arrT.push(dataSets[i].T);
      arrH.push(dataSets[i].H);
    }
    chart.data.labels = createLabels(Lbls);
    console.log(ThS);console.log(MS);console.log(MT);console.log(MH);
    chart.data.datasets = [
      ThSDataSet(),
      SDataSet(arrS),
      TDataSet(arrT),
      HDataSet(arrH),
    ];
    // console.log(ThSDataSet());
  }
  chart.update();
  callback();
}