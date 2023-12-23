#include <WiFiNINA.h>
#include <MQTT.h>
#include <MQTTClient.h>

//##### DEFINITIONS #####

//H-bridge & Peltier 1
#define P1_PWM_PIN 3  //PWM Pin
#define P1_A_PIN 2
#define P1_B_PIN 4

//H-bridge & Peltier 2
#define P2_PWM_PIN 5  //PWM Pin
#define P2_A_PIN 7
#define P2_B_PIN 8

//H-bridge & Peltier 3
#define P3_PWM_PIN 6  //PWM Pin
#define P3_A_PIN 12
#define P3_B_PIN 13

//H-bridge & Peltier 4
#define P4_PWM_PIN 9  //PWM Pin
#define P4_A_PIN A0
#define P4_B_PIN A1

//H-bridge & Peltier 5
#define P5_PWM_PIN 10  //PWM Pin
#define P5_A_PIN A2
#define P5_B_PIN A3

//H-bridge & Peltier 6
#define P6_PWM_PIN 11  //PWM Pin
#define P6_A_PIN A4
#define P6_B_PIN A5

const char ssid[] = "LOCAL_NETWORK_SSID";
const char pass[] = "LOCAL_NETWORK_PASSWORD";

WiFiClient net;
MQTTClient client;

unsigned long lastMillis = 0;

bool collision;

void connect() {
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  while (!client.connect("arduino", "INSTANCE_NAME", "TOKEN")) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("collision");
}

void messageReceived(String &topic, String &payload) {
  if(payload == "true") {
    warmAll();
  }
  if(payload == "false") {
    coolAll();
  }
}

void setup() {
  Serial.begin(115200);

    //H-bridge & Peltier 1
  pinMode(P1_A_PIN, OUTPUT);
  pinMode(P1_B_PIN, OUTPUT);
  pinMode(P1_PWM_PIN, OUTPUT);

  //H-bridge & Peltier 2
  pinMode(P2_A_PIN, OUTPUT);
  pinMode(P2_B_PIN, OUTPUT);
  pinMode(P2_PWM_PIN, OUTPUT);

  //H-bridge & Peltier 3
  pinMode(P3_A_PIN, OUTPUT);
  pinMode(P3_B_PIN, OUTPUT);
  pinMode(P3_PWM_PIN, OUTPUT);

  //H-bridge & Peltier 4
  pinMode(P4_A_PIN, OUTPUT);
  pinMode(P4_B_PIN, OUTPUT);
  pinMode(P4_PWM_PIN, OUTPUT);

  //H-bridge & Peltier 5
  pinMode(P5_A_PIN, OUTPUT);
  pinMode(P5_B_PIN, OUTPUT);
  pinMode(P5_PWM_PIN, OUTPUT);

  //H-bridge & Peltier 6
  pinMode(P6_A_PIN, OUTPUT);
  pinMode(P6_B_PIN, OUTPUT);
  pinMode(P6_PWM_PIN, OUTPUT);

  // start wifi and mqtt
  WiFi.begin(ssid, pass);
  client.begin("INSTANCE_NAME.cloud.shiftr.io", net);
  client.onMessage(messageReceived);

  connect();
}

void loop() {

  if (millis() - lastMillis > 10) {
    lastMillis = millis();
    client.loop();
  }

  // check if connected
  if (!client.connected()) {
    connect();
  }
}

void coolAll() {
  digitalWrite(P1_A_PIN, HIGH);
  digitalWrite(P1_B_PIN, LOW);
  analogWrite(P1_PWM_PIN, 255);

  digitalWrite(P2_A_PIN, HIGH);
  digitalWrite(P2_B_PIN, LOW);
  analogWrite(P2_PWM_PIN, 255);

  digitalWrite(P3_A_PIN, HIGH);
  digitalWrite(P3_B_PIN, LOW);
  analogWrite(P3_PWM_PIN, 255);

  digitalWrite(P4_A_PIN, HIGH);
  digitalWrite(P4_B_PIN, LOW);
  analogWrite(P4_PWM_PIN, 255);

  digitalWrite(P5_A_PIN, HIGH);
  digitalWrite(P5_B_PIN, LOW);
  analogWrite(P5_PWM_PIN, 255);

  digitalWrite(P6_A_PIN, HIGH);
  digitalWrite(P6_B_PIN, LOW);
  analogWrite(P6_PWM_PIN, 255);
}
void warmAll() {
  digitalWrite(P1_A_PIN, LOW);
  digitalWrite(P1_B_PIN, HIGH);
  analogWrite(P1_PWM_PIN, 180);

  digitalWrite(P2_A_PIN, LOW);
  digitalWrite(P2_B_PIN, HIGH);
  analogWrite(P2_PWM_PIN, 180);

  digitalWrite(P3_A_PIN, LOW);
  digitalWrite(P3_B_PIN, HIGH);
  analogWrite(P3_PWM_PIN, 180);

  digitalWrite(P4_A_PIN, LOW);
  digitalWrite(P4_B_PIN, HIGH);
  analogWrite(P4_PWM_PIN, 180);

  digitalWrite(P5_A_PIN, LOW);
  digitalWrite(P5_B_PIN, HIGH);
  analogWrite(P5_PWM_PIN, 180);

  digitalWrite(P6_A_PIN, LOW);
  digitalWrite(P6_B_PIN, HIGH);
  analogWrite(P6_PWM_PIN, 180);
}