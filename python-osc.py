from sklearn.externals import joblib
from pythonosc import dispatcher
from pythonosc import osc_server
from pythonosc import osc_message_builder
from pythonosc import udp_client
import argparse
import time
import random

def print_click(unused_addr, *args):
	pose = args
	pred = clf.predict([pose])
	print(pred)

	if pred:  
		print("got it: ", pred)
		client.send_message("/prediction", pred)

if __name__ == "__main__":
	clf = joblib.load('classifier/machinelearning.pkl')

	# client is the sending port (port 12000). this is where we will send to
	client = udp_client.SimpleUDPClient("127.0.0.1", 12000)

	# use this to test osc sending  will send 10 random numbers
	# for x in range(10):
	# 	client.send_message("/filter", random.random())
	# 	time.sleep(1)

	dispatcher = dispatcher.Dispatcher()
	dispatcher.map("/skeletal_data", print_click)

	# server listens for incoming messages on port 3334
	server = osc_server.ThreadingOSCUDPServer(
		("127.0.0.1", 3334), dispatcher)
	print("Serving on {}".format(server.server_address))
	server.serve_forever()



