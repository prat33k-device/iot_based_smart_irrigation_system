#include<HTTPClient.h>
#include <WiFi.h>

// credientials
const char* ssid = "loading";                            // computer should be connected to the network also for working at localhost
const char* password =  "Satyam844@";
const String serverURL = "http://172.22.53.30:3000";
const String authKey = "Jqoe6UzmSPjG7E0";

//pins

// defines the sensor update rate
const int sensor_refresh_rate = 3;
// defines the pump refresh rate
const int pump_delay = 10000;
int count = 0;
int current_pump_status = 0;

HTTPClient http;

void update_sensor() {
    http.begin(serverURL + "/update-sensor");
    String payload = "authKey=" + authKey + "&soil_moisture=9988&temp=32&humidity=25";
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
}

void operate_pump(int x) {

  if(x == 0) {
    digitalWrite(2, LOW);
    Serial.println("pump off");
  } else if(x == 1) {
    digitalWrite(2, HIGH);
    Serial.println("pump on");
  }
  
}

void setup() {
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

  test_req();
  
  current_pump_status = get_pump_status();
  
}

void loop() {


  if(WiFi.status()== WL_CONNECTED) {
    
    if(count == 0) {
      update_sensor();
    }

    int pump_status = get_pump_status();

    if(pump_status != current_pump_status) {
      current_pump_status = pump_status;
      operate_pump(pump_status);
    }

    count++;
    count = count % sensor_refresh_rate;

    delay(pump_delay);
    
  } else {
    delay(500);
  }
  
}
