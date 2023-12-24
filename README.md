Sensory Cartography

___Project description

Sensory Cartography is an embodied interaction team project developed in the Interaction Design program at Zurich University of the Arts. The project was developed by Carina Good, Loïc Hommel, Nanthatchaporn Pree Janthasom and Marc Loewer in the fall term 2023.

A thermo-active vest lets you experience the past presence of other people in a space. When the vest wearer walks at a position someone was walking at earlier, the vest heats up. Outside of these traces, it cools down. This creates an intimate experience pointing to the entanglements on our life journey as well as the search of warmth and emotion in everyday encounters.

![doc1](/doc/img/doc1.jpeg)
![doc2](/doc/img/doc2.jpeg)
![doc3](/doc/img/doc3.jpeg)
![doc4](/doc/img/doc4.jpeg)
![doc5](/doc/img/doc5.jpeg)

___Setup and parts

5 ESP32‘s are at the heart of the indoor location tracking. They have ultra-wide-band distance calculation capabilities. Two work as anchors to which three tags calculate their distance from. One tag is built into the vest, two more can be used to lay the traces. The distances are sent to a node backend on a local machine. 

The backend calculates positions, stores trace data and calculates collisions. The frontend is served locally on the machine with Express. The frontend UI allows for precise configuration of different parameters like path radius, length, space dimensions and many more. It also has debugging features like visualizing detected collisions.

The node backend also sends collision data to Shiftr.IO (cloud) that functions as a MQTT broker. An Arduino in the vest controls the peltier elements and receives signals for heating and cooling via MQTT. All elements use a common local network for communication.

___Context
Project developed at Zurich University of the Arts, Interaction Design Programme. Code for Arduino and tags developed by Loïc Hommel and Carina Good.

___Configuration

Use a local network for communication of ESP tags, Arduino and personal machine.

**For the Node program**
Add your Shiftr token to the config.js file, in the format mqtt://A:B@A.cloud.shiftr.io so that A = shiftr instance name  in small letters and B = secret token.

**For the ESP32 Tags** 
Enter the SSID and password of the local network you want to use for communication. Do this at line 55 and 56 in the respective .ino files. Change also the server IP to the personal machine in the network that you want to run the node program on (line 57).

**For the Arduino**
Enter the SSID and password of the local network you are using for communication. Do this at line 37 and 38 in the arduino_vest_peltier.ino. For the connection to the Shiftr instance, enter at line 55 the instance name in small letters and the token (do not enter the whole URL in the format mqtt://A:B@A.cloud.shiftr.io). Change the instance name in small letters in the URL-String at line 109.

For the anchors there is no configuration needed. Anchor code available at https://github.com/Makerfabs/Makerfabs-ESP32-UWB-DW3000/blob/main/example/range/range_tx/range_tx.ino

You have to add your own icons at /public/assets/icons and your own fonts at /public/fonts for license reasons.

Don’t forget to install the ESP32 Add-On in Arduino IDE and use the ESP32 Dev Module for uploading sketches to the ESP32s.

Libraries
For the node program: All dependencies listed in package.json
For the Arduino: Use the WiFi library that suits your board. This was tested with an Arduino WiFi Rev2 using the WiFiNINA library by Arduino. For MQTT use the MQTT library by Joel Gaehwiler.
For the ESP tags: Include the DW3000 library by NConcepts (repo maintained by Makerfabs).

___This is a prototype developed in an educational context. It is published for portfolio, archiving, and reminding myself about configuration. No liability for any safety and security issues!
