// Handles all visualization on the canvas
let drawRoomMap = function(inCollision, mainColumnElement, getConfigFromMainApp, callData) {

    //These are not the value origins, they are just a temporary for the drawing operations
    let x = 0;
    let y = 0;
    let rad1 = 0;
    let rad2 = 0;
    let rad3 = 0;
    let buffer;

    let sketch = function(p) {

        p.setup = function() {
            let canvas = p.createCanvas(mainColumnElement.clientWidth,mainColumnElement.clientHeight);
            canvas.parent(mainColumnElement);
        };

        p.draw = function() {

            let {xVal, yVal, radius1, radius2, radius3, gridUnit} = getConfigFromMainApp();
            x = xVal;
            y = yVal;
            rad1 = radius1;
            rad2 = radius2;
            rad3 = radius3;

            buffer = callData();

            p.background(255,255,255);
            p.drawRectangle();
            p.drawGrid(gridUnit);  
            p.drawAnchor1();
            p.drawAnchor2();
            p.drawInputMarker();
            p.drawMouse();  

            

            if (buffer.tag1.some(value => value === undefined)) {
                console.log('Error: undefined inside positionCalculation');
                return;
            } else {
                p.drawTag1(rad1);
                p.drawLineThroughPoints(buffer.tag1);
            }

            if (buffer.tag2.some(value => value === undefined)) {
                console.log('Error: undefined inside positionCalculation');
                return;
            } else {
                p.drawTag2(rad2);
                p.drawLineThroughPoints(buffer.tag2);
            }

            if (buffer.tag3.some(value => value === undefined)) {
                console.log('Error: undefined inside positionCalculation');
                return;
            } else {
                p.drawTag3(rad3);
                p.drawLineThroughPoints(buffer.tag3);
            }

            p.drawRadiusAroundLines(rad1, rad2, rad3);

            inCollision();
        };

        //// All necessary drawing functions //// 

        p.drawRectangle = function() {
            p.fill(226,226,226);
            p.rect(80,(p.height-80-y),x,y,2);
            p.noStroke();
        };

        p.drawGrid = function(gridUnit) {  
            const anchor1X = 80;
            const anchor1Y = p.height - 80;
        
            for (let i = 0; i <= x; i += gridUnit) {
                p.stroke(128,128,128);
                p.line(anchor1X + i, anchor1Y, anchor1X + i, anchor1Y - y);
            }  
        
            for (let i = 0; i <= y; i += gridUnit) {
                p.stroke(128,128,128);
                p.line(anchor1X, anchor1Y - i, anchor1X + x, anchor1Y - i);
            }  
        };

        p.drawAnchor1 = function() {
            p.noStroke();
            p.fill(255,0,0);
            p.ellipse((80),(p.height-80),20,20);
        };

        p.drawMouse = function() {
            p.noStroke();
            p.fill(230);
            p.ellipse(p.mouseX,p.mouseY,20,20);
        };

        p.drawInputMarker = function() {
            p.noStroke();
            p.fill(230,230,230);
            p.ellipse((80+x),((p.height-80)-y),20,20);
        };

        p.drawAnchor2 = function() {
            p.noStroke();
            p.fill(255,0,0);
            p.ellipse((80+x),(p.height-80),20,20);
        };

        p.drawTag1 = function(radius) {
            p.fill(0, 0, 255);
            p.ellipse((80+buffer.tag1[0][0]), ((p.height - 80) - buffer.tag1[0][1]), 20, 20);
            p.noStroke();
            const color = p.color(0);
            color.setAlpha(10);
            p.fill(color);
            p.ellipse((80+buffer.tag1[0][0]), ((p.height - 80) - buffer.tag1[0][1]), radius, radius);
        };
        
        p.drawTag2 = function(radius) {  
            p.fill(0, 0, 0);
            p.ellipse((80+buffer.tag2[0][0]), ((p.height - 80) - buffer.tag2[0][1]), 20, 20);
            p.noStroke();
            const color = p.color(0);
            color.setAlpha(10);
            p.fill(color);
            p.ellipse((80+buffer.tag2[0][0]), ((p.height - 80) - buffer.tag2[0][1]), radius, radius);
        };
        
        p.drawTag3 = function(radius) { 
            p.fill(0, 0, 0);
            p.ellipse((80+buffer.tag3[0][0]), ((p.height - 80) - buffer.tag3[0][1]), 20, 20);
            p.noStroke();
            const color = p.color(0);
            color.setAlpha(10);
            p.fill(color);
            p.ellipse((80+buffer.tag3[0][0]), ((p.height - 80) - buffer.tag3[0][1]), radius, radius);
        };
        
        p.drawLineThroughPoints = function(points) {
            p.noFill();
            p.stroke(0);
            p.beginShape();
            points.forEach(point => {
                p.vertex((80+point[0]), ((p.height - 80) - point[1]));
            });
            p.endShape();
        };

        p.drawRadiusAroundLines = function(rad1, rad2, rad3) {
            p.noStroke();
            const color = p.color(0);
            color.setAlpha(10);
            p.fill(color);
            buffer.tag1.forEach(pos => {
                p.ellipse((80+pos[0]), ((p.height - 80) - pos[1]), rad1*2, rad1*2);
            });
        
            buffer.tag2.forEach(pos => {
                p.ellipse((80+pos[0]), ((p.height - 80) - pos[1]), rad2*2, rad2*2);
            });
        
            buffer.tag3.forEach(pos => {
                p.ellipse((80+pos[0]), ((p.height - 80) - pos[1]), rad3*2, rad3*2);
            });
        };
        // Here was the collision detection
    };

    let ctx = new p5(sketch);

}

export default drawRoomMap;