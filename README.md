# Machines Learning Movement in p5.js / Kinectron

[Kat Sullivan's Machine Learning Moving project](https://github.com/katsully/machines-learning-movement) ported to p5.js using Kinectron.

These instructions are for Mac. If you're working on a PC, go to README_win.md for tips for Windows users.

## Let's Run It

This project works in three steps:

1. Record and label movements using the Kinect, Kinectron and p5.js
2. Use a classifer to teach our computers how to identify our movements
3. Trigger something fun with our movements!

## Step 1: p5.js and Kinectron

Run a Kinectron serer on a PC on your local network. Follow [these instructions](https://kinectron.github.io/docs/server.html). 

Download (or clone) this entire github repo and unzip it. It doesn't matter where you save it.

Open the project (the entire folder) in your text editor, something like Sublime or Atom.

Open the file KinectRecordingMovement/sketch.js. Enter your Kinectron IP address.

```javascript

// Define and create an instance of kinectron

var kinectronIpAddress = "10.0.1.5"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
kinectron = new Kinectron(kinectronIpAddress);

```

Open terminal. Navigate into the project folder (cd path/to/folder) and open a simple http server.

```

// in terminal use the cd command to move into your project folder
// it will look something like this

cd /Users/yourname/mlmp5ktron 

// now that you're in your folder, start a server

python -m SimpleHTTPServer

```

You should see something like "Serving HTTP on 0.0.0.0 port 8000 ..."

Open your browser (only tested in Chrome) and navigate to localhost:8000 (replace 8000 with whatever host your computer is serving on.

You should see your project files. Open http://localhost:8000/KinectRecordingMovement/

You should see a live video pop up in your sketch. If you see the video, you're good to move forward. 

### Recording Instructions

1. Press 1
2. Make a pose and hit record (r)
3. Stop recording (r)
4. Repeat steps 2 and 3 with a few of your partners doing the same pose from step 2
5. Repeat steps 1-4 but press 2 or 3 to record data for new poses!
6. Hit save (s). Save the file in KinectRecordingMovement/bodydata.csv

You can close the recording sketch now. 

## Step 2: Let the Machine Learn!

---
**Note**

This next step requires python3. If you have both python2 and python3 installed, you can do [this](https://stackoverflow.com/questions/10763440/how-to-install-python3-version-of-package-via-pip-on-ubuntu) to run python3 without overriding python2. 

--- 

For this step we'll be using the classifier/movement\_machine\_learning.py file.

Open a new terminal tab or window. 

In the new terminal tab install scikit-learn. 

```
pip install scikit-learn

```

Install numpy+mlk

```pip install nltk```

Install scipy

```pip install scipy```

In terminal, run

```

python classifier/movement_machine_learning.py

// if you have both python2 and python3 on your machine
python3 classifier/movement_machine_learning.py

```

### Step 3: Make something cool!

This project uses OSC, or [open sound control](http://opensoundcontrol.org/introduction-osc), to send data between the browser and the python script that is predicting poses. We will need to setup OSC to run out of python and into the browser.

Make sure node is installed. Type node --version in the terminal. If it comes up with a version number, like v8.9.4, you're good to go. Otherwise. [Install node](https://nodejs.org/en/).

Then, in terminal, install the following dependencies

```
npm install http@0.0.0
npm install node-osc@2.0.0
npm install socket.io@1.4.5

```

Now, in terminal run bridge.js with node

```
node bridge.js

// you'll know this is working properly if it says "hello" in the terminal

```

Now we just need to start osc on the python side. 

In terminal, install pythonosc

```python3 -m pip install python-osc```

Then install sklearn

```python3 -m pip install sklearn```

Now, we'll open our p5 sketch. 

In your text editor, open vj_with_our_bodies/vj-sketch.js and enter your Kinectron server IP address.

```
// Define and create an instance of kinectron

var kinectronIpAddress = "10.0.1.5"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
kinectron = new Kinectron(kinectronIpAddress);

```

Make sure that your simple http server is still running and open up your file directory in Chrome again (ie. localhost:8000). Open vj_with_our_bodies.

Now run the python osc code with: 

```
python python-osc.py

```

Your trained classifier is now guessing your poses based on the trained data your previously recorded. Now decide what should happen with each pose!


