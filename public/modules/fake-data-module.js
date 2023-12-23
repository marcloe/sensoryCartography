
let startFakeData = function(mainColumnElement, getConfigFromMainApp, writeToBuffer, dataStarted, setDataStarted) {

    if (dataStarted) {
        console.log('Fake data already started, abolished duplicate call')
        return;
    }

    let x = 0;
    let y = 0;
    let rad1 = 0;
    let rad2 = 0;
    let rad3 = 0;
    let fake = {positions: {tag1: undefined, tag2: undefined, tag3: undefined,}, velocities: {tag1: undefined, tag2: undefined, tag3: undefined,},};

    let fakeDataGenerator = function(p) {
        
        p.setup = function() {
            let canvas = p.createCanvas(mainColumnElement.clientWidth,mainColumnElement.clientHeight);
            fake.positions.tag1 = p.createVector((100),(900));
            fake.velocities.tag1 = p.createVector(p.random(3, 5), p.random(3, 5));
            fake.positions.tag2 = p.createVector((300),(800));
            fake.velocities.tag2 = p.createVector(p.random(3, 5), p.random(3, 5));
            fake.positions.tag3 = p.createVector((600),(900));
            fake.velocities.tag3 = p.createVector(p.random(3, 5), p.random(3, 5));
        };
        
        p.draw = function() {

            let {xVal, yVal, radius1, radius2, radius3} = getConfigFromMainApp();
            x = xVal;
            y = yVal;
            rad1 = radius1;
            rad2 = radius2;
            rad3 = radius3;
    
            fake.positions.tag1.add(fake.velocities.tag1);
            fake.positions.tag2.add(fake.velocities.tag2);
            fake.positions.tag3.add(fake.velocities.tag3);

            let rectLeft = 80;
            let rectRight = (80 + x);
            let rectTop = (p.height-80-y)
            let rectBottom = (p.height-80)

            if (fake.positions.tag1.x < rectLeft || fake.positions.tag1.x > rectRight) {
                fake.velocities.tag1.x *= -1;
            }
            if (fake.positions.tag1.y < rectTop || fake.positions.tag1.y > rectBottom) {
                fake.velocities.tag1.y *= -1;
            }
            
            if (fake.positions.tag2.x < rectLeft || fake.positions.tag2.x > rectRight) {
                fake.velocities.tag2.x *= -1;
            }
            if (fake.positions.tag2.y < rectTop || fake.positions.tag2.y > rectBottom) {
                fake.velocities.tag2.y *= -1;
            }
            
            if (fake.positions.tag3.x < rectLeft || fake.positions.tag3.x > rectRight) {
                fake.velocities.tag3.x *= -1;
            }
            if (fake.positions.tag3.y < rectTop || fake.positions.tag3.y > rectBottom) {
                fake.velocities.tag3.y *= -1;
            }

            writeToBuffer([fake.positions.tag1.x, fake.positions.tag1.y], [fake.positions.tag2.x, fake.positions.tag2.y], [fake.positions.tag3.x, fake.positions.tag3.y]) 
        };
    };
    
    new p5(fakeDataGenerator);
    setDataStarted(true);
};

export default startFakeData;

