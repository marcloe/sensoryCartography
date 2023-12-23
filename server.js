const express = require('express');
/* const path = require('path'); */
const net = require('net');
const p5 = require('node-p5');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const { on } = require('events');
const config = require('./config');

const mqttclient = mqtt.connect(config.mqttUrl, {
  clientId: 'javascript'
});

mqttclient.on('connect', function() {
    console.log('mqtt connected!');
});

// Global variables

let pathLength = 20;
let floorX = 670;
let floorY = 700;
let radiusTag1 = 30;
let radiusTag2 = 30;
let radiusTag3 = 30;
let collisionDetected = false;
let collisionTimeout;
let damper = 500;

let positionBuffer = {
    tag1: [[undefined,undefined]],
    tag2: [[undefined,undefined]],
    tag3: [[undefined,undefined]],
}

// Web server for serving the UI web page
const app = express();
const expressPort = 3000; // Change this to your desired port
app.use(express.static('public'));
app.listen(expressPort, () => {
    console.log(`Express server listening on port ${expressPort}`);
});

// Websocket server for serving the UI web page

const wss = new WebSocket.Server({ port: 8085 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        let data = JSON.parse(message);
        console.log(data);
        if (data.prop == 'Heigth (in cm)') {
            floorY = Number(data.value);
            console.log ('floorY changed to ' + floorY + '.');
        }
        if (data.prop == 'Width (in cm)') {
            floorX = Number(data.value);
            console.log ('floorX changed to ' + floorX + '.');
        }

        if (data.prop == 'Radius Tag 1') {
            radiusTag1 = Number(data.value);
            console.log ('radiusTag1 changed to ' + radiusTag1 + '.');
        }

        if (data.prop == 'Radius Tag 2') {
            radiusTag2 = Number(data.value);
            console.log ('radiusTag2 changed to ' + radiusTag2+ '.');
        }

        if (data.prop == 'Radius Tag 3') {
            radiusTag3 = Number(data.value);
            console.log ('radiusTag3 changed to ' + radiusTag3 + '.');
        }

        if (data.prop == 'Fade') {
            pathLength = Number(data.value);
            console.log ('pathLength changed to ' + pathLength + '.');
        }
        
        if (data.prop == 'Damper') {
            pathLength = Number(data.value);
            console.log ('damper changed to ' + pathLength + '.');
        }
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};




// Data port (net server) for incoming distance data
const dataPort = 1234;

const server = net.createServer((socket) => {
    socket.on('data', (data) => {

        const dataString = data.toString().replace(/[\r\n]+/g, '');
        if (dataString.trim() == '') {
            return;
        }

        const dataArray = dataString.split(',');

        let position = [undefined, undefined];
        let distance1 = (parseFloat(dataArray[1]))*100;
        let distance2 = (parseFloat(dataArray[2]))*100;
    
/*         console.log('These are the distances: ' + distance1 + ' and ' + distance2 + '.'); */

        let result = 0;
        result = positionCalculation(floorX, distance1, distance2);
        if (result !== undefined) {

            position[0] = result.x;
            position[1] = result.y;
        } else {
            console.log('Error: result is undefined');
            return;
        }

/*         console.log('This is the position x: ' + position.x + 'This is the position y: ' + position.x +'.') */
/*         console.log('Point C: This is x ' + result.x + ' This is y ' + result.y); */

        if (dataArray[0] === 'd003') {
            console.log('Coming from d003');
            writeToBuffer(position, undefined, undefined);
        }
        if (dataArray[0] === 'd004') {
            console.log('Coming from d004');
            writeToBuffer(undefined, position, undefined);
        }
        if (dataArray[0] === 'd005') {
            console.log('Coming from d005');
            writeToBuffer(undefined, undefined, position);
        }
        
        wss.broadcast(JSON.stringify(positionBuffer));
/*         console.log('This is the position buffer: ' + JSON.stringify(positionBuffer) + '.'); */
    });
});

server.listen(dataPort, () => {
    console.log(`TCP server listening on port ${dataPort}`);
});

function positionCalculation(distAB, distAC, distBC) {
/*     console.log('Calculating position...'); */
/*     console.log('distAB: ' + distAB + ', distAC: ' + distAC + ', distBC: ' + distBC + '.'); */
    let anchorA = {x: 0, y: 0};
    let anchorB = {x: distAB, y: 0};

    let d = distAB;

    let r0 = distAC;
    let r1 = distBC;

    if (d > r0 + r1) {
        r0 = r0 + 20;
        r1 = r1 + 20;
        if (d > r0 + r1) {
            console.log('No solution, d>r0+r1');
            return;
        }
    }

    if (d < Math.abs(r0 - r1)) {
        console.log('No solution, d<|r0-r1|');
        return;
    }

    if (d === 0 && r0 === r1) {
        console.log('Infinite number of solutions, d==== &&& r0===r1');    // Infinite number of solutions
        return;
    }

    let a = (r0*r0 - r1*r1 + d*d) / (2*d);
    let argument = (r0*r0 - a*a);
    if (argument < 0.0) {
        console.log('No solution, argument < 0.0');
        return;
    };
    let h = Math.sqrt(argument);

    let x2 = anchorA.x + a * (anchorB.x - anchorA.x) / d;
    let y2 = anchorA.y + a * (anchorB.y - anchorA.y) / d;

    let x3 = x2 + h * (anchorB.y - anchorA.y) / d;
    let y3 = y2 - h * (anchorB.x - anchorA.x) / d;

    let x4 = x2 - h * (anchorB.y - anchorA.y) / d;
    let y4 = y2 + h * (anchorB.x - anchorA.x) / d;

    x3 = Math.abs(x3);
    x4 = Math.abs(x4);

    if (x3 == undefined || y4 == undefined) {
        console.log('Error: undefined inside positionCalculation');
        return;
    } else {
        return {x: x3, y: y4};
    }
    
}

function writeToBuffer(a,b,c) {
    let currentLength = positionBuffer.tag1.length;
    let lengthDifference = currentLength - pathLength;

    if (lengthDifference > 0) {
        positionBuffer.tag1.splice(pathLength, lengthDifference);
        positionBuffer.tag2.splice(pathLength, lengthDifference);
        positionBuffer.tag3.splice(pathLength, lengthDifference);
    }

    if (a !== undefined) {
        if (positionBuffer.tag1.length >= pathLength) {
            positionBuffer.tag1.pop();
        }
        positionBuffer.tag1.unshift(a);
    }

    if (b !== undefined) {
        if (positionBuffer.tag2.length >= pathLength) {
            positionBuffer.tag2.pop();
        }
        positionBuffer.tag2.unshift(b);
    }

    if (c !== undefined) {
        if (positionBuffer.tag3.length >= pathLength) {
            positionBuffer.tag3.pop();
        }
        positionBuffer.tag3.unshift(c);
    }
}



// Collision detection code wrapped in a p5 instance

function sketch(p) {
    p.setup = () => {
        p.createCanvas(floorX, floorY);
    }
    p.draw = () => {
        p.calculateIntersection(positionBuffer, radiusTag1, radiusTag2, radiusTag3);
    }

    p.calculateIntersection = function(buffer, rad1, rad2, rad3) {
        let allRadii = [rad1, rad2, rad3];
        let posTag1 = buffer.tag1[0];
        let tag1Radius = allRadii[0];
        let collisionDetected = false;
        outerLoop:
        for(let i = 1; i < (Object.keys(buffer).length); i++) {
            let otherCircle = Object.values(buffer)[i];
            let otherCircleRadius = allRadii[i];
    
            for (let j = 0; j < (Object.keys(otherCircle).length); j++) {
    
                let dx = otherCircle[j][0] - posTag1[0];
                let dy = otherCircle[j][1] - posTag1[1];
                let position = Math.sqrt(dx * dx + dy * dy);
    
                if(position <= tag1Radius + otherCircleRadius) {
                    onCollisionDetected();
                    break outerLoop;
                }
            }
        }

    };
}

let p5Instance = p5.createSketch(sketch); // Do not remove this line although never read


function onCollisionDetected() {
    collisionDetected = true;
    clearTimeout(collisionTimeout);
    collisionTimeout = setTimeout(() => {
        collisionDetected = false;
        if (mqttclient.connected) {
            mqttclient.publish('collision', `${false}`);
        } else {
            console.log('MQTT client is not connected');
        }
        wss.broadcast(JSON.stringify({ type: 'myBoolean', value: collisionDetected}));

    }, damper);
    if (mqttclient.connected) {
        mqttclient.publish('collision', `${true}`);
    } else {
        console.log('MQTT client is not connected');
    }
    wss.broadcast(JSON.stringify({ type: 'myBoolean', value: collisionDetected}));
}