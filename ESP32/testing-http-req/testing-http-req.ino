#include<HTTPClient.h>
#include <WiFi.h>
#include <DFRobot_DHT11.h>

// credientials
const char* ssid = "loading";                            // computer should be connected to the network also for working at localhost
const char* password =  "Satyam844@";
const String serverURL = "http://172.22.53.30:3000";
const String authKey = "Jqoe6UzmSPjG7E0";

//pins
const int soil_moisture_pin = 34;
const int dht_pin = 4;
const int relay_pin = 12;

// defines the sensor update rate
const int sensor_refresh_rate = 3;
// defines the pump refresh rate
const int pump_delay = 2000;
int count = 0;
int current_pump_status = 0;                    // 0 -> OFF    1 -> ON

HTTPClient http;
DFRobot_DHT11 DHT;


void update_sensor(int s, int t, int h) {
  http.begin(serverURL + "/update-sensor");
  String payload = "authKey=" + authKey + "&soil_moisture=" + s + "&temp=" + t + "&humidity=" + h;
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int httpResponseCode = http.POST(payload);
  delay(100);
  String postRes = http.getString();
  Serial.print("update POST RESPONSE: ");
  Serial.println(postRes);
  http.end();
}

void test_req() {
  http.begin(serverURL + "/test");
  int httpResCode = http.GET();
  String resPayload = http.getString();
  Serial.print("GET RESPONSE: ");
  Serial.println(resPayload);    // OK == connection enstablished
  http.end();
}

int get_pump_status() {
  http.begin(serverURL + "/pump-status/" + authKey);
  int httpResCode = http.GET();
  String resPayload = http.getString();
  Serial.print("pump status: ");
  Serial.println(resPayload);
  http.end();

  if(resPayload == "OFF") {
    return 0;
  } else if(resPayload == "ON") {
    return 1;
  }
  return -1;
}

void operate_pump(int x) {              // 0 -> OFF    1 -> ON

  if(x == 0) {
    digitalWrite(2, LOW);
    Serial.println("pump off");
  } else if(x == 1) {
    digitalWrite(2, HIGH);
    Serial.println("pump on");
  }

  if(x == 0) {
    digitalWrite(relay_pin, HIGH);
    Serial.println("pump off");
  } else if(x == 1) {
    digitalWrite(relay_pin, LOW);
    Serial.println("pump on");
  }
  
}

bool water_required(int soil_moisture, int tempr, int humid) {
  if(soil_moisture < 1900) {
    return true;
  }
  return false;
}

void set_pump_status(String x) {
  http.begin(serverURL + "/set-pump-status");
  String payload;
  if(x == "ON") {
    payload = "authKey=" + authKey + "&newStatus=1";
  } else if(x == "OFF") {
    payload = "authKey=" + authKey + "&newStatus=0";
  }
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int httpResponseCode = http.POST(payload);
  delay(100);
  String postRes = http.getString();
  Serial.print("set_pump_status POST RESPONSE: ");
  Serial.println(postRes);
  http.end();
}

void setup() {

  pinMode(2, OUTPUT);
  pinMode(relay_pin, OUTPUT);
  digitalWrite(relay_pin, HIGH);
  
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);             //Start wifi connection
  Serial.print("Connecting...");
  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(500);
    Serial.print(".");
  }

  Serial.print("Connected, my IP: ");
  Serial.println(WiFi.localIP());

  delay(2000);

  if(WiFi.status()== WL_CONNECTED) {
    test_req();
    current_pump_status = get_pump_status(); 
  }
    
}

void loop() {

  int soil_moisture = analogRead(soil_moisture_pin);
  Serial.print("SOIL_MOISTURE: ");
  Serial.println(soil_moisture);
  DHT.read(dht_pin);
  int tempr = DHT.temperature;
  int humid = DHT.humidity;

  if(current_pump_status == 0 && water_required(soil_moisture, tempr, humid)) {
    if(WiFi.status()== WL_CONNECTED) {
      set_pump_status("ON"); 
    }

    current_pump_status = 1;
    operate_pump(current_pump_status);
  }
  if(current_pump_status == 1 && water_required(soil_moisture, tempr, humid) == false) {
    if(WiFi.status()== WL_CONNECTED) {
      set_pump_status("OFF"); 
    }

    current_pump_status = 0;
    operate_pump(current_pump_status);
  }
  
  if(WiFi.status()== WL_CONNECTED) {
    
    if(count == 0) {
      update_sensor(soil_moisture, tempr, humid);
    }

    int pump_status = get_pump_status();

    if(pump_status != -1 && pump_status != current_pump_status) {
      current_pump_status = pump_status;
      operate_pump(current_pump_status);
    }

    count++;
    count = count % sensor_refresh_rate;

    delay(pump_delay);
    
  } else {
    delay(2000);
  }
  
}
