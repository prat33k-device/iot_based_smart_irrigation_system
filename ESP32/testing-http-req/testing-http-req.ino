#include<HTTPClient.h>
#include <WiFi.h>

// computer should be connected to the network also
const char* ssid = "loading";
const char* password =  "Satyam844@";
const String serverURL = "http://172.22.53.30:3000";

int count = 3;
HTTPClient http;


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

  http.begin(serverURL + "/test");
  delay(1000);
  int httpResCode = http.GET();
  delay(1000);
  String resPayload = http.getString();
  delay(1000);
  Serial.print("GET RESPONSE: ");
  Serial.println(resPayload);
  http.end();

}

void loop() {


  if(count > 0) {
    delay(100);
    http.begin(serverURL + "/sensor");
    String payload = "sensor_value=9988,password=prateek1999";
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    int httpResponseCode = http.POST(payload);
    delay(100);
    String postRes = http.getString();
    Serial.print("POST RESPONSE: ");
    Serial.println(postRes);
    http.end();
  }
  
  count--;
}
