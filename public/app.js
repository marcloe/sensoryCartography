import drawRoomMap from "./modules/drawing-module.js";


const gridBase = 80;
let pathLength = 200;
let x = 0;
let y = 0;
let radiusTag1 = 0;
let radiusTag2 = 0;
let radiusTag3 = 0;
let unitForGrid = 100;
let dataStarted = false;
let collisionDetected = false;
let backendSocket;

let positionBuffer = {
    tag1: [[undefined,undefined]],
    tag2: [[undefined,undefined]],
    tag3: [[undefined,undefined]],
}


// UI-only stuff


const containerElement = document.getElementById('container');
const topElement = document.getElementById('top');
const wrapperElement = document.getElementById('wrapper');
const menuColumnElement = document.getElementById('menuColumn');
const mainColumnElement = document.getElementById('mainColumn');
const propertyColumnElement = document.getElementById('propertyColumn');
const containerOverlay = document.getElementById('containerOverlay');

const menuButtonsList = {
    resize: ['assets/icons/transform.svg'],
    start: ['assets/icons/play.svg'],
    checkoutput: ['assets/icons/eye.svg'],
    visualize: ['assets/icons/palette.svg'],
    physics: ['assets/icons/atom.svg'],
    switch: ['assets/icons/toggle-right.svg'],
};

const topButtonsList = {
    power: ['assets/icons/power.svg'],
    connection: ['assets/icons/wifi-off.svg'],
    globalSettings: ['assets/icons/tool.svg'],
};

const propertyList = {
    resize: {
        title: 'Resize space',
        options: {
            1: ['Heigth (in cm)', 'text'],
            2: ['Width (in cm)', 'text'],
        },
    },
    start: {
        title: 'Initializations',
        options: {
            1: ['Position data', 'button'],
        },
    },
    checkoutput: {
        title: 'Check output',
        options: {
            1: ['Collision detection', 'div'],
            2: ['Signal received by heat element', 'div'],
        },
    },
    visualize: {
        title: 'Adjust visualization',
        options: {
            1: ['Grid line every … cm', 'text'],
        },
    },
    physics: {
        title: 'Change physical rules',
        options: {
            1: ['Radius Tag 1', 'text'],
            2: ['Radius Tag 2', 'text'],
            3: ['Radius Tag 3', 'text'],
            4: ['Fade', 'text'],
            5: ['Damper', 'text'],
        },
    },
    switch: {
        title: 'Change mapping mode',
        options: {
            1: ['Toggle', 'button'],
        },
    },
}

let propertyValues = {};

for (let menu in propertyList) {
    for (let option in propertyList[menu].options) {
        let propertyName = propertyList[menu].options[option][0];
        propertyValues[propertyName] = '';
    }
}



let handler = {
    set: function(obj, prop, value) {

        if (['Heigth (in cm)', 'Width (in cm)', 'Radius Tag 1', 'Radius Tag 2', 'Radius Tag 3', 'Fade', 'Damper'].includes(prop)) {
            if (backendSocket && backendSocket.readyState === 1) {
                backendSocket.send(JSON.stringify({prop,value}));
                console.log('sent '+ JSON.stringify({prop,value}) + ' to backend')
            } else {
                alert('WebSocket connection is not open. Cannot send data.');
            }
        }

        if (prop == 'Heigth (in cm)') {
            y = Number(value);
        }
        if (prop == 'Width (in cm)') {
            x = Number(value);
        }

        if (prop == 'Radius Tag 1') {
            radiusTag1 = Number(value);
        }

        if (prop == 'Radius Tag 2') {
            radiusTag2 = Number(value);
        }

        if (prop == 'Radius Tag 3') {
            radiusTag3 = Number(value);
        }

        if (prop == 'Fade') {
            pathLength = Number(value);
        }

        if (prop == 'Damper') {
            pathLength = Number(value);
        }

        if (prop == 'Grid line every … cm') {
            unitForGrid = Number(value);
        }

        obj[prop] = value;
        return true;
    }
};

let proxy = new Proxy(propertyValues, handler);

// - - -

function setupElements() {

    containerElement.style.height = window.innerHeight + 'px';
    containerElement.style.width = window.innerWidth + 'px';

    topElement.style.height = gridBase + 'px';
    topElement.style.width = (containerElement.clientWidth * 1) + 'px';

    wrapperElement.style.height = ((containerElement.clientHeight)-gridBase)+'px';
    wrapperElement.style.width = (containerElement.clientWidth * 1) + 'px';

    menuColumnElement.style.height = (wrapperElement.clientHeight * 1) + 'px';
    menuColumnElement.style.width = gridBase+'px';

    propertyColumnElement.style.height = (wrapperElement.clientHeight * 1) + 'px';
    propertyColumnElement.style.width = (7*gridBase)+'px';
  
    mainColumnElement.style.height = (wrapperElement.clientHeight * 1) + 'px';
    mainColumnElement.style.width = (((wrapperElement.clientWidth)-menuColumnElement.clientWidth)-propertyColumnElement.clientWidth)+'px';

    containerOverlay.style.height = wrapperElement.clientHeight + 'px';
    containerOverlay.style.width = wrapperElement.clientWidth + 'px';
    containerOverlay.style.top = topElement.clientHeight + 'px';
    containerOverlay.style.left = '0px';
    containerOverlay.style.visibility = 'hidden';

    for (let i in Object.keys(menuButtonsList)) { 
        let k = document.createElement('div');
        k.setAttribute('data-menu', `${Object.keys(menuButtonsList)[i]}`)
        k.classList.add('menu-button')
        k.classList.add('button');
        k.style.backgroundImage = 'url('+`${(Object.values(menuButtonsList)[i])[0]}`+')';
        k.style.height = gridBase + 'px';
        k.style.width = menuColumnElement.clientWidth + 'px';
        Object.values(menuButtonsList)[i].push(k);
        menuColumnElement.appendChild(k);
    }

    for (let i in Object.keys(topButtonsList)) { 
        let k = document.createElement('div');
        k.setAttribute('id',`${Object.keys(topButtonsList)[i]}`);
        k.setAttribute('data-menu', `${Object.keys(topButtonsList)[i]}`)
        k.classList.add('top-button');
        k.classList.add('button');
        k.style.backgroundImage = 'url('+`${(Object.values(topButtonsList)[i])[0]}`+')';
        k.style.height = topElement.clientHeight + 'px';
        k.style.width = gridBase + 'px';
        Object.values(topButtonsList)[i].push(k);
        topElement.appendChild(k);
    }
}

function createInputElement(type, options, propertyName) {
    let inputElement;
    switch(type) {
        case 'text':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.classList.add('inputText');
            inputElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    proxy[propertyName] = this.value;
                }
           });
            break;
        case 'slider':
            inputElement = document.createElement('input');
            inputElement.type = 'range';
            break;
        case 'colorPicker':
            inputElement = document.createElement('input');
            inputElement.type = 'color';
            break;
        case 'button':
            inputElement = document.createElement('button');
            inputElement.type = 'button';
            if (propertyName == 'Position data') {
                inputElement.setAttribute('id', 'startButton');
                inputElement.addEventListener('click', () => {
                    if (dataStarted == false) {
                        setDataStarted(true);
                        connectWebSocket();
                    }
                });
            };

            if (propertyName == 'Toggle') {
                inputElement.setAttribute('id', 'toggleButton');
            };

            break;
        case 'div':
            inputElement = document.createElement('div');
            inputElement.type = 'div';

            if (propertyName == 'Collision detection') {
                inputElement.setAttribute('id', 'collisionviz');
            };

            if (propertyName == 'Signal received by heat element') {
                inputElement.setAttribute('id', 'heatviz');
            };

            break;
        default:
            console.error('Invalid input type');
            return;
    }
    return inputElement;
}

function drawPropertyList(e) {
    let menu = e.target.dataset.menu;
    let propertyCaption = document.createElement('div');
    propertyCaption.classList.add('propertyCaption');
    propertyCaption.style.height = gridBase + 'px';
    propertyCaption.style.width = propertyColumnElement.clientWidth + 'px';
    propertyCaption.textContent = propertyList[menu].title;
    propertyColumnElement.innerHTML = '';
    propertyColumnElement.appendChild(propertyCaption);
    
    for (let i=0; i < (Object.keys(propertyList[menu].options)).length; i++) {
        let k = document.createElement('div');
        k.setAttribute('data-property', `${propertyList[menu].options[i+1][0]}`)
        k.classList.add('property');
        k.style.height = gridBase + 'px';
        k.style.width = propertyColumnElement.clientWidth + 'px';
        k.textContent = propertyList[menu].options[i+1][0];
        propertyColumnElement.appendChild(k);

        let k2 = document.createElement('div');
        k2.classList.add('input-wrapper');
        k2.setAttribute('data-inputtype', `${propertyList[menu].options[i+1][1]}`)
        if(propertyList[menu].title == 'Check output') {
            console.log('checkoutput');
            k2.style.height =(gridBase*5) + 'px';
            k2.classList.add('input-wrapper-double');
        } else {
            k2.style.height = gridBase + 'px';
        }
        k2.style.width = propertyColumnElement.clientWidth + 'px';

        let inputType = propertyList[menu].options[i+1][1];
        let propertyName = propertyList[menu].options[i+1][0];
        let inputElement = createInputElement(inputType, (propertyList[menu].options[i+1]), propertyName);
        k2.appendChild(inputElement);
        propertyColumnElement.appendChild(k2);
    }
}

function drawOverlay() {
    if(containerOverlay.style.visibility == 'visible') {
        containerOverlay.style.visibility = 'hidden';
    } else {
        containerOverlay.style.visibility = 'visible';
    }
}

// Page setup

setupElements();

Object.values(menuButtonsList).forEach((listEntry)=>{
    listEntry[1].addEventListener('click', drawPropertyList);
});

Object.values(topButtonsList).forEach((listEntry)=>{
    listEntry[1].addEventListener('click', drawOverlay);
});


// Next stuff

function getConfigFromMainApp() {
    return {xVal: x, yVal: y, radius1: radiusTag1, radius2: radiusTag2, radius3: radiusTag3, gridUnit: unitForGrid};
}

function callData() {
    return positionBuffer;
}



function inCollision() {
    if (collisionDetected == true) {
        if(document.getElementById('collisionviz')) {
            document.getElementById('collisionviz').style.backgroundColor = 'red';
        };
    } else {
        if(document.getElementById('collisionviz')) {
            document.getElementById('collisionviz').style.backgroundColor = 'green';
        };
    }
}

function setDataStarted(truthValue) {
    dataStarted = truthValue;
};

//// Canvas Setup //// Start the draw and pass the config and the function to request new data

drawRoomMap(inCollision, mainColumnElement, getConfigFromMainApp, callData);

// Web Socket setup function

function connectWebSocket() {
    console.log('Connecting to websocket...')
    backendSocket = new WebSocket('ws://127.0.0.1:8085');
    backendSocket.onmessage = function(event) {

        let message = JSON.parse(event.data);

        if (message.type === 'myBoolean') {
            collisionDetected = message.value;
            console.log(message.value);
            // Do something with myBoolean
        } else {
            positionBuffer = message;
        }
    };
}

