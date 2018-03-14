/*

Lisa Jamhoury 
deepLearn / ml5 research project
github.com/lisajamhoury

based on 
Kat Sullivan
 Brooklyn Research 2017
 github.com/katsully
 
 */

// Set to true if using live kinectron data
var liveData = false;

// recorded data variables
var sentTime = Date.now();
var currentFrame = 0;
var connected = false;

var socket;
var myCanvas;

var kinectron;

var depth = 600;
var zVal = 1;
var rotX = Math.PI;

var pose="";

var showBody = true;
var col;

var interval = 0;

function setup() {
  myCanvas = createCanvas(1024, 768);
  setupOsc(12000, 3334);

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
    kinectron.startMultiFrame(["color", "body"], processKinectData);  
  }
  
}

// FOR TESTING OSC 
// function mousePressed() {
//   console.log('yo');
//   //socket.emit('/test', '127.0.0.1:12000');
//   sendOsc('/skeletal_data', 9);
// }


// takes place of oscEvent
function receiveOsc(address, value) {
  console.log("received OSC: " + address + ", " + value);

  if (address == "/prediction") {
    console.log(value[0]);
    pose = value[0];
    return;
  }
  
  // TEST CODE 
  // if (address == '/test') {
  //   x = value[0];
  //   y = value[1];
  // }
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

  console.log("value", value);

  if (address && value) {
    console.log('sending');
    sendOsc(address, value);
  }
}

function setupOsc(oscPortIn, oscPortOut) {
  console.log('im here');
  socket = io.connect('http://127.0.0.1:8081', { port: 8081, rememberTransport: false });
  socket.on('connect', function() {

    console.log('im connected');
    initKinectron();
    socket.emit('config', { 
      server: { port: oscPortIn,  host: '127.0.0.1'},
      client: { port: oscPortOut, host: '127.0.0.1'}
    });
  });
  socket.on('message', function(msg) {
    console.log('got something');
    console.log(msg);
    if (msg[0] == '#bundle') {
      for (var i=2; i<msg.length; i++) {
        receiveOsc(msg[i][0], msg[i].splice(1));
      }
    } else {
      receiveOsc(msg[0], msg.splice(1));
    }
  });
}


function draw() {
  if (!liveData && connected) loopRecordedData();

}

function processKinectData(data) {
  background(0);

  if (data.color) {
   loadImage(data.color, function(loadedImage) {
    image(loadedImage, width-320, 0, 320, 240);
   });
  }
  
  //translate the scene to the center 
  push();
  translate(width/2, height/2);
  
  if (data.body) {

    if (liveData) {
      findTrackedBodies(data.body);
    }

    if (!liveData) {
      drawTrackedBody(data.body);
    }
    
  } // data.body

 pop();

} // process kinect data


function findTrackedBodies(bodies) {

  var skeletonArray =  bodies;

  // if one or more body is tracked, loop through each body
  // NOTE - this code is meant to only track one body, modifications will be needed for multi-person recording
  for (var i = 0; i < skeletonArray.length; i++) {
    var skeleton = skeletonArray[i];

    if (skeleton.tracked) {
      drawTrackedBody(skeleton);
    
    } // skeleton tracked 

  } // skeleton array loop

}


function drawTrackedBody(skeleton) {
  var joints = skeleton.joints;

  var col;

  //Draw body
  if(pose == "POSE 1") {
    col = color(255,0,0);
  } else if(pose == "POSE 2") {
    col = color(0,255,0);
  } else if(pose == "POSE 3") {
    col = color(0,0,255);
  } else {
    col  = color(255, 105, 180);
  }

  stroke(col);
  if (showBody) {
    drawBody(joints);
  }

  if(interval % 100 === 0) {
    sendData(joints);
  }
  interval++;

}

function keyPressed() {
  if (keyCode === ENTER) {
    kinectron.stopAll();
  } else if (keyCode === UP_ARROW) {
    kinectron.startRecord();
  } else if (keyCode === DOWN_ARROW) {
    kinectron.stopRecord();
  } else if (key === '8') {
    kinectron.startMultiFrame(['color', 'depth', 'body']);
  }
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
  strokeWeight(10);
  point(joints[jointType].colorX*myCanvas.width/4, joints[jointType].colorY*myCanvas.height/4);
}

function drawBone(joints, jointType1, jointType2) {
  strokeWeight(1);
  //line(joints[jointType1].colorX*myCanvas.width/4, joints[jointType1].colorY, joints[jointType2].colorX*myCanvas.width/4, joints[jointType2].colorY*myCanvas.height/4);
  strokeWeight(10);
  point(joints[jointType2].colorX*myCanvas.width/4, joints[jointType2].colorY*myCanvas.height/4);
}

// function drawHandState(KJoint joint) {
//   handState(joint.getState());
//   strokeWeight(5.0f + joint.getZ()*20);
//   point(joint.getX()*40, joint.getY()*40, joint.getZ()*40);
// }

// function handState(int handState) {
//   switch(handState) {
//   case KinectPV2.HandState_Open:
//     stroke(0, 255, 0);
//     break;
//   case KinectPV2.HandState_Closed:
//     stroke(255, 0, 0);
//     break;
//   case KinectPV2.HandState_Lasso:
//     stroke(0, 0, 255);
//     break;
//   case KinectPV2.HandState_NotTracked:
//     stroke(100, 100, 100);
//     break;
//   }
// }