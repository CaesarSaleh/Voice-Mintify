import os
from flask import Flask, jsonify, render_template, Response, request, redirect
import tensorflow as tf
from tensorflow import keras
import numpy as np
import cv2
from keras.models import load_model
import numpy as np

app = Flask(__name__)

facedetect = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

cap=cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)
font=cv2.FONT_HERSHEY_COMPLEX


model = load_model('keras_model.h5')


def get_className(classNo):
	if classNo == 1:
		return "Verified"
	elif classNo == 0:
		return "Not Verified"

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

def face_detect():
	while True:
		sucess, imgOrignal=cap.read()
		faces = facedetect.detectMultiScale(imgOrignal,1.3,5)
		for x,y,w,h in faces:
			crop_img=imgOrignal[y:y+h,x:x+h]
			img=cv2.resize(crop_img, (224,224))
			img=img.reshape(1, 224, 224, 3)
			prediction=model.predict(img)
			# print(prediction)
			classIndex = np.argmax(prediction, axis=-1)
			# print(classIndex)
			probabilityValue=np.amax(prediction)
			if classIndex==0:
				cv2.rectangle(imgOrignal,(x,y),(x+w,y+h),(0,255,0),2)
				cv2.rectangle(imgOrignal, (x,y-40),(x+w, y), (0,255,0),-2)
				cv2.putText(imgOrignal, "Verified",(x,y-10), font, 0.75, (255,255,255),1, cv2.LINE_AA)
			elif classIndex==1:
				cv2.rectangle(imgOrignal, (x, y), (x+w, y+h), (0, 0, 255), 2)
				cv2.rectangle(imgOrignal, (x, y-40), (x+w, y), (0, 0, 255), -2)
				cv2.putText(imgOrignal, "Not Verified",(x,y-10), font, 0.75, (255,255,255),1, cv2.LINE_AA)

			cv2.putText(imgOrignal,str(round(probabilityValue*100, 2))+"%" ,(180, 75), font, 0.75, (255,0,0),2, cv2.LINE_AA)
		ret, buffer = cv2.imencode('.jpg', imgOrignal)
		# k=cv2.waitKey(1)
		# if k==ord('q'):
		# 	break
		imgOrignal = buffer.tobytes()
		yield (b'--frame\r\n'
				b'Content-Type: image/jpeg\r\n\r\n' + imgOrignal + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(face_detect(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.after_request(add_cors_headers)  
    app.run(port=4000, debug=True)
