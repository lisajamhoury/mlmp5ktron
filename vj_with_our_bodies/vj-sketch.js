/*

Lisa Jamhoury 
deepLearn / ml5 research project
github.com/lisajamhoury

based on 
Kat Sullivan
Brooklyn Research 2017
github.com/katsully

with some sine inspiration from 
Dan Shiffman
 
 */

// Set to true if using live kinectron data
var liveData = true;

// for kinectron -- live kinect data
var kinectron;

// for socket io -- connect to python classifier
var socket;

// p5 canvas 
var myCanvas;

// pose indicators
var pose="";
var col;

// positioning variables
var centerX;
var centerY;
var bodyOffSetX;
var bodyOffSetY;
var jointWeight;

// sine wave drawing variables 
var xspacing = 10;   // Distance between each horizontal location
var w;              // Width of entire wave
var maxwaves = 5;   // total # of waves to add together
var theta = 0.0;
var amplitude = new Array(maxwaves);   // Height of wave
var dx = new Array(maxwaves);         
var yvalues;    
var sinWidth = 0;
var sinHeight = 0;

// time variable for osc / python communication
var interval = 0;

// recorded data timing variables
var sentTime = Date.now();
var currentFrame = 0;
var connected = false;


function setup() {

  myCanvas = createCanvas(1024*2/3, 768*2/3);
  setupOsc(12000, 3334);

  if (!liveData) frameRate(30);
  
  setupPositionVars();
  setupSineVars();

}

function draw() {
  if (!liveData) {
    background(0);
    // draw sine waves 
    calcWave();
    renderWave();  
  }

  if (!liveData && connected) loopRecordedData();

}


function loopRecordedData() {
  
  // send data every 20 seconds 
  if (Date.now() > sentTime + 20) {
    //bodyTracked(recorded_skeleton[currentFrame])
    var data = {};
    // data.color = null;
    data.body = recorded_skeleton[currentFrame];
    processKinectData(data);
    sentTime = Date.now();

    if (currentFrame < recorded_skeleton.length-1) {
      currentFrame++;
    } else {
      currentFrame = 0;
    }
  }

}

function initKinectron() {

  // Define and create an instance of kinectron
  var kinectronIpAddress = "10.0.1.5"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
  kinectron = new Kinectron(kinectronIpAddress);
  connected = true;

  if (liveData) {
    kinectron.makeConnection();
    kinectron.startBodies(processKinectData);  
  }
  
}

function setupPositionVars() {
  // setup positioning variables for skeleton
  jointWeight = myCanvas.width/100;
  centerX = myCanvas.width/2
  centerY = myCanvas.height/2;
  bodyOffSetX = myCanvas.width/5;
  bodyOffSetY = myCanvas.height/5;
}

function setupSineVars() {
  // variables needed for sine drawing
  w = width + 16;

  for (var i = 0; i < maxwaves; i++) {
    amplitude[i] = random(1,30);
    var period = random(100,300); // Num pixels before wave repeats
    dx[i] = (TWO_PI / period) * xspacing;
  }

  yvalues = new Array(floor(w/xspacing));

}

function processKinectData(data) {
  if (liveData) {
    background(0);

    // draw sine waves 
    calcWave();
    renderWave();
  }

  strokeWeight(2);
  stroke(0);
  fill(255);
  rect(myCanvas.width-bodyOffSetX*1.5, myCanvas.height-bodyOffSetY*1.5, bodyOffSetX*1.5, bodyOffSetY*1.5);
  noStroke();
  fill(0);
  rect(myCanvas.width-bodyOffSetX*1.5, myCanvas.height-bodyOffSetY*1.5 - bodyOffSetY/10, bodyOffSetX*1.5, bodyOffSetY/10+5);
  fill(255);
  text(pose, myCanvas.width-bodyOffSetX*1.5, myCanvas.height-bodyOffSetY*1.5,);
  
  if (data.bodies) {

    if (liveData) findTrackedBodies(data.bodies);
  
    if (!liveData) drawTrackedBody(data.bodies);    
  
  } 
} 


//////////////////////////////// OSC Variables //////////////////////////////


// takes place of oscEvent
function receiveOsc(address, value) {

  if (address == "/prediction") {
    pose = value[0];
    return;
  }
}

function sendOsc(address, value) {
  socket.emit('message', [address].concat(value));
}

function sendData(joints) {
  var address = "/skeletal_data";
  var value = [];

  for (var i=0; i<joints.length; i++) {
    if (joints[i].cameraX !== undefined) value.push(joints[i].cameraX);
      else value.push(0.0);
    if (joints[i].cameraY !== undefined) value.push(joints[i].cameraY);
      else value.push(0.0);
    if (joints[i].cameraZ !== undefined) value.push(joints[i].cameraZ);
      else value.push(0.0);
    if (joints[i].orientationW !== undefined) value.push(joints[i].orientationW);
      else value.push(0.0);
    if (joints[i].orientationX !== undefined) value.push(joints[i].orientationX);
      else value.push(0.0);
    if (joints[i].orientationY !== undefined) value.push(joints[i].orientationY);
      else value.push(0.0);
    if (joints[i].orientationZ !== undefined) value.push(joints[i].orientationZ);
      else value.push(0.0);
  }


  if (address && value) {
    sendOsc(address, value);
  }
}

function setupOsc(oscPortIn, oscPortOut) {
  socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
  socket.on('connect', function() {

    initKinectron();
    socket.emit('config', { 
      server: { port: oscPortIn,  host: '127.0.0.1'},
      client: { port: oscPortOut, host: '127.0.0.1'}
    });
  });
  socket.on('message', function(msg) {    
    if (msg[0] == '#bundle') {
      for (var i=2; i<msg.length; i++) {
        receiveOsc(msg[i][0], msg[i].splice(1));
      }
    } else {
      receiveOsc(msg[0], msg.splice(1));
    }
  });
}



//////////////////////////////// Draw Sine Wave //////////////////////////////

function calcWave() {
  // Increment theta (try different values 
  // for 'angular velocity' here
  theta += 0.1;

  // Set all height values to zero
  for (var i = 0; i < yvalues.length; i++) {
    yvalues[i] = 0;
  }
 
  // Accumulate wave height values
  for (var j = 0; j < maxwaves; j++) {
    var x = theta;
    for (var i = 0; i < yvalues.length; i++) {
      // Every other wave is cosine instead of sine
      if (j % 2 == 0)  yvalues[i] += sin(x)*amplitude[j];
      else yvalues[i] += cos(x)*amplitude[j];
      x+=dx[j];
    }
  }
}

function renderWave() {
  noStroke();
  fill(255);
  
  for (var i= 0; i < 20; i++ ) {
  for (var x = 0; x < yvalues.length; x++) {
    rect(yvalues[x] -100 + (50 *i), x * xspacing, sinWidth, sinHeight);
  }
  }
}



//////////////////////////////// Process and Draw Body //////////////////////////////

function findTrackedBodies(bodies) {
  var allBodies =  bodies;

  // if one or more body is tracked, loop through each body
  // NOTE - this code is meant to only track one body, modifications will be needed for multi-person recording
  for (var i = 0; i < allBodies.length; i++) {
    var body = allBodies[i];
    if (body.tracked) drawTrackedBody(body);
  } 
}


function drawTrackedBody(body) {
  var col;
  var joints = body.joints;
  
  //Draw body
  if(pose == "POSE 1") {
    col = color(255,0,0);
    sinWidth = myCanvas.width/400; //150
    sinHeight = myCanvas.height/200; //100
  } else if(pose == "POSE 2") {
    col = color(0,255,0);
    sinWidth = myCanvas.width/25;
    sinHeight = myCanvas.height/75;
  } else if(pose == "POSE 3") {
    col = color(0,0,255);
    sinWidth = myCanvas.width/15;
    sinHeight = myCanvas.height/15;
  } else {
    col  = color(255, 105, 180);
    sinWidth = myCanvas.width/100;
    sinHeight = myCanvas.height/100;
  }

  stroke(col);
  drawBody(joints);

  if(interval % 100 === 0) sendData(joints);
  interval++;

}

function drawBody(joints) {
  drawBone(joints, kinectron.HEAD, kinectron.NECK);
  drawBone(joints, kinectron.NECK, kinectron.SPINESHOULDER);
  drawBone(joints, kinectron.SPINESHOULDER, kinectron.SPINEMID);

  drawBone(joints, kinectron.SPINEMID, kinectron.SPINEBASE);
  drawBone(joints, kinectron.SPINESHOULDER, kinectron.SHOULDERRIGHT);
  drawBone(joints, kinectron.SPINESHOULDER, kinectron.SHOULDERLEFT);
  drawBone(joints, kinectron.SPINEBASE, kinectron.HIPRIGHT);
  drawBone(joints, kinectron.SPINEBASE, kinectron.HIPLEFT);

  // Right Arm    
  drawBone(joints, kinectron.SHOULDERRIGHT, kinectron.ELBOWRIGHT);
  drawBone(joints, kinectron.ELBOWRIGHT, kinectron.WRISTRIGHT);
  drawBone(joints, kinectron.WRISTRIGHT, kinectron.HANDRIGHT);
  drawBone(joints, kinectron.HANDRIGHT, kinectron.HANDTIPRIGHT);
  drawBone(joints, kinectron.WRISTRIGHT, kinectron.THUMBRIGHT);

  // Left Arm
  drawBone(joints, kinectron.SHOULDERLEFT, kinectron.ELBOWLEFT);
  drawBone(joints, kinectron.ELBOWLEFT, kinectron.WRISTLEFT);
  drawBone(joints, kinectron.WRISTLEFT, kinectron.HANDLEFT);
  drawBone(joints, kinectron.HANDLEFT, kinectron.HANDTIPLEFT);
  drawBone(joints, kinectron.WRISTLEFT, kinectron.THUMBLEFT);

  // Right Leg
  drawBone(joints, kinectron.HIPRIGHT, kinectron.KNEERIGHT);
  drawBone(joints, kinectron.KNEERIGHT, kinectron.ANKLERIGHT);
  drawBone(joints, kinectron.ANKLERIGHT, kinectron.FOOTRIGHT);

  // Left Leg
  drawBone(joints, kinectron.HIPLEFT, kinectron.KNEELEFT);
  drawBone(joints, kinectron.KNEELEFT, kinectron.ANKLELEFT);
  drawBone(joints, kinectron.ANKLELEFT, kinectron.FOOTLEFT);

  drawJoint(joints, kinectron.HANDTIPLEFT);
  drawJoint(joints, kinectron.HANDTIPRIGHT);
  drawJoint(joints, kinectron.FOOTLEFT);
  drawJoint(joints, kinectron.FOOTRIGHT);

  drawJoint(joints, kinectron.THUMBLEFT);
  drawJoint(joints, kinectron.THUMBRIGHT);

  drawJoint(joints, kinectron.HEAD);
}

function drawJoint(joints, jointType) {
  strokeWeight(jointWeight);
  point(joints[jointType].colorX*myCanvas.width/4 + bodyOffSetX + centerX, joints[jointType].colorY*myCanvas.height/4 + bodyOffSetY + centerY);
}

function drawBone(joints, jointType1, jointType2) {
  strokeWeight(1);
  line(joints[jointType1].colorX*myCanvas.width/4 + bodyOffSetX + centerX, joints[jointType1].colorY*myCanvas.height/4 + bodyOffSetY + centerY , joints[jointType2].colorX*myCanvas.width/4 + bodyOffSetX + centerX, joints[jointType2].colorY*myCanvas.height/4 + bodyOffSetY + centerY);
  
  strokeWeight(jointWeight/3);
  point(joints[jointType2].colorX*myCanvas.width/4 + bodyOffSetX + centerX, joints[jointType2].colorY*myCanvas.height/4 + bodyOffSetY + centerY);
}

