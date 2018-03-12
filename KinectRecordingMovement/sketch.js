/*
Lisa Jamhoury 
deepLearn / ml5 research project
github.com/lisajamhoury

Based on
Kat Sullivan
 Brooklyn Research 2017
 github.com/katsully
 */

var myCanvas;
var kinectron;

// where we will store the data
var table;

// a list of all points in the body that the Kinect tracks
var bones = ["SpineBase", "SpineMid", "Neck", "Head", "ShoulderLeft", "ElbowLeft", "WristLeft", "HandLeft", 
"ShoulderRight", "ElbowRight", "WristRight", "HandRight", "HipLeft", "KneeLeft", "AnkleLeft", "FootLeft", "HipRight", "KneeRight", 
"AnkleRight", "FootRight", "SpineShoulder", "HandTipLeft", "ThumbLeft", "HandTipRight", "ThumbRight" ];

// this will be used to let us know when we are recording
var recording = false;

// this will be used to let us know when we have saved the file
var saved = false;

var poseNum = null;

// we'll use this to timestamp our spreadsheet
var date = Date.now();

var depth = 600;
var zVal = 1;
var rotX = Math.PI;

function setup() {
  myCanvas = createCanvas(960 , 540);
  background(0);


  table = new p5.Table();

  for ( var i = 0; i < bones.length; i++) {
    table.addColumn(bones[i]+"_x");
    table.addColumn(bones[i]+"_y");
    table.addColumn(bones[i]+"_z");
    table.addColumn(bones[i]+"_Orientation_w");
    table.addColumn(bones[i]+"_Orientation_x");
    table.addColumn(bones[i]+"_Orientation_y");
    table.addColumn(bones[i]+"_Orientation_z");
  }


  // Define and create an instance of kinectron
  var kinectronIpAddress = "10.0.1.5"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
  kinectron = new Kinectron(kinectronIpAddress);
  //enable 3d  with (x,y,z) position
  //kinect.enableSkeleton3DMap(true);

  kinectron.makeConnection();
  kinectron.startMultiFrame(["color", "body"], processKinectData);

}

function draw() {

}


function processKinectData(data) {
  background(0);

  if (data.color) {
   loadImage(data.color, function(loadedImage) {
    image(loadedImage, width-320, 0, 320, 240);
   });
 }
  
  //image(kinect.getColorImage(), width-320, 0, 320, 240);

  //translate the scene to the center 
  push();
  translate(width/2, height/2);
  //scale(zVal);
  //rotateX(rotX);
  
  if (data.body) {
  
  // console.log(data.body);
  // debugger; 
  
  var skeletonArray =  data.body;


    // if one or more body is tracked, loop through each body
    // NOTE - this code is meant to only track one body, modifications will be needed for multi-person recording
    for (var i = 0; i < skeletonArray.length; i++) {
      var skeleton = skeletonArray[i];
      if (skeleton.tracked) {
        var joints = skeleton.joints;

        //draw different color for each hand state
        //  drawHandState(joints[KinectPV2.JointType_HandRight]);
        //drawHandState(joints[KinectPV2.JointType_HandLeft]);

        //Draw body
        var col  = color(255, 105, 180);
        stroke(col);
        drawBody(joints);
        // if we are recording send data to our data table
        if (recording) {
          recordData(joints);
        }
      }
    }


  }

 pop();

  // gives the text a red color
  fill(255, 0, 0);
  textSize(40);
  // extremely basic interface to let the user know when they're recording
  // when the file is saved, etc
  if(saved) {
    text("FILE SAVED", 50, 100);
  }
  if(recording) {
    text("RECORDING",50, 50);
  }
  if(poseNum !== null ) {
    text("POSE NUMBER: " + poseNum, 50, 150);
  }

}

// this is where Processing draws the skeleton
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

// void drawHandState(KJoint joint) {
//   handState(joint.getState());
//   strokeWeight(5.0f + joint.getZ()*20);
//   point(joint.getX()*40, joint.getY()*40, joint.getZ()*40);
// }

// void handState(int handState) {
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

// // // sending each value for each joint to our data table
function recordData(joints){
  console.log('recordin!');
  var newRow = table.addRow();
  for(var i=0; i<joints.length; i++){
    newRow.setNum(bones[i] + "_x", joints[i].cameraX);
    newRow.setNum(bones[i] + "_y", joints[i].cameraY);
    newRow.setNum(bones[i] + "_z", joints[i].cameraZ);
    newRow.setNum(bones[i] + "_Orientation_w", joints[i].orientationW);
    newRow.setNum(bones[i] + "_Orientation_x", joints[i].orientationX);
    newRow.setNum(bones[i] + "_Orientation_y", joints[i].orientationY);
    newRow.setNum(bones[i] + "_Orientation_z", joints[i].orientationZ);
  }
}

// // this let's us interact with the program and tell it when we want to record, 
// // which pose we want to record, and when to save the file
function keyPressed(){
  console.log(keyCode);
  if(keyCode == 83) { // keycode for 's'
    // save the table and give it a timestamp
    saveTable(table, "data/test" + Date.now() +".csv");
    saved = true;
  } else if(keyCode == 82) { // keycode for 'r'
    recording = !recording;
    var newRow = table.addRow(); 
    newRow.setString("SpineBase_x", "NEW RECORDING"); 
  } else if(keyCode == 49) { // keycode for '1'
    poseNum = 1;
    var newRow = table.addRow();
    newRow.setString("SpineBase_x", "NEW RECORDING"); 
    newRow.setString("SpineBase_x", "POSE 1");
  } else if(keyCode == 50) { // keycode for '2'
    poseNum = 2;
    var newRow = table.addRow();
    newRow.setString("SpineBase_x", "POSE 2");
  } else if(keyCode == 51) { // keycode for '3'
    poseNum = 3;
    var newRow = table.addRow();
    newRow.setString("SpineBase_x", "POSE 3");
  }
}