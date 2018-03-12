# Machines Learning Movement in p5.js / Kinectron

[Kat Sullivan's Machine Learning Moving project](https://github.com/katsully/machines-learning-movement) ported to p5.js using Kinectron.

## Let's Run It

This project works in three steps:

1. Record and label movements using the Kinect and p5.js
2. Use a classifer to teach our computers how to identify our movements
3. Trigger something fun with our movements!

## Step 1: p5.js and Kinectron

Make sure you have Kinectron running on a PC on your local network. Follow [these instructions](https://kinectron.github.io/docs/server.html). 

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

DELETE THIS?
Now, check if your computer is 32 bit or 64 bit. To do this, go to Control Panel -> System and Security -> System. Under System Type, it should way whether you have a 32-bit Operating System or 64-bit Operating System. This will be important to know moving forward!

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
**Note: For Windows Users**

First, we need to make sure Python has been installed. (This is only for Window users, Python comes standard in Mac).

Open the Command Prompt and type Python. If it says Python 3.5.xx ...., you're all set! If not, please download [Python](https://www.python.org/downloads/windows). We want the 3.5.4 release, and use the Windows x86-64 MSI installer. Open the installer and make sure the "Put Python in Path" is selected.

If you have both python2 and python3, the trick is to rename the python3 executable to python3.

You'll need the get\_pip.py file if you don't already have pip installed. The get\_pip.py is included in this repo. Run 

```python get\_pip.py```

Once this is complete add C:\Python27\Scripts to your PATH, then close and reopen your terminal.

---


---
**Note: For Mac Users **

This next step requires python3. If you have both python2 and python3 installed, you can do [this](https://stackoverflow.com/questions/10763440/how-to-install-python3-version-of-package-via-pip-on-ubuntu) to run python3 without overriding python2. 

--- 

For this step we'll be using the classifier/movement\_machine\_learning.py file.

Open a new terminal tab or window. 

In the new terminal tab install scikit-learn. 

```
// On Mac 
pip install scikit-learn

// On PC
python -m pip install scikit-learn

```

Install numpy+mlk

For Windows users: 

Install numpy+mlk libraries: download the numpy+mkl [file](http://www.lfd.uci.edu/~gohlke/pythonlibs/#numpy). I downloaded the 64 bit for Python 3.5. Then cd into downloads and 

```pip install numpy‑1.11.3+mkl‑cp35‑cp35m‑win_amd64.whl```

For Mac users: 

```pip install nltk```

---
**Note**

If you get an error filename.whl is not supported wheel on this platform, you may be using a 32bit version of Python, to double check out the python interpreter and write

```
import platform
platform.architecture()[0]
```

This will either print 32bit or 64bit. Obviously, if it says 32bit you'll need to download the appropriate wheel file.

Else, rename the file to numpy‑1.11.3+mkl‑cp35‑none-any.whl and rerun pip install.

---

Install scipy

For Windows Users

To do so, download the whl file [here](http://www.lfd.uci.edu/~gohlke/pythonlibs/#scipy) Then cd into downloads and 

```pip install scipy-0.19.1-cp35-cp35m-win_amd64.whl```

For Mac Users

```pip install scipy```


Finally, open the movement_machine_learning.py (in the classifer folder) file with a text editor (ie Sublime Text).

In terminal, run

```python classifier/movement_machine_learning.py```

OR

```python3 classifier/movement_machine_learning.py```

if you have both python2 and python3 on your machine.


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



