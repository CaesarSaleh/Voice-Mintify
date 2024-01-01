from flask import Flask, jsonify, render_template, Response, request
import tensorflow as tf
from tensorflow import keras
import numpy as np
import cv2
from keras.models import load_model
import numpy as np
import sqlite3


app = Flask(__name__)


def init_db():
    conn = sqlite3.connect('tokens.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenid TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()


def empty_tokens_table():
    conn = sqlite3.connect('tokens.db')
    cursor = conn.cursor()

    # Delete all rows from the tokens table
    cursor.execute('DELETE FROM tokens')

    conn.commit()
    conn.close()


init_db()
empty_tokens_table()

facedetect = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)
font = cv2.FONT_HERSHEY_COMPLEX


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
        sucess, imgOrignal = cap.read()
        faces = facedetect.detectMultiScale(imgOrignal, 1.3, 5)
        for x, y, w, h in faces:
            crop_img = imgOrignal[y:y+h, x:x+h]
            img = cv2.resize(crop_img, (224, 224))
            img = img.reshape(1, 224, 224, 3)
            prediction = model.predict(img)
            print(prediction)
            classIndex = np.argmax(prediction, axis=-1)
            print(classIndex)
            probabilityValue = np.amax(prediction)
            if classIndex == 0:
                cv2.rectangle(imgOrignal, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.rectangle(imgOrignal, (x, y-40), (x+w, y), (0, 255, 0), -2)
                cv2.putText(imgOrignal, "Verified", (x, y-10), font,
                            0.75, (255, 255, 255), 1, cv2.LINE_AA)
            elif classIndex == 1:
                cv2.rectangle(imgOrignal, (x, y), (x+w, y+h), (0, 0, 255), 2)
                cv2.rectangle(imgOrignal, (x, y-40), (x+w, y), (0, 0, 255), -2)
                cv2.putText(imgOrignal, "Not Verified", (x, y-10),
                            font, 0.75, (255, 255, 255), 1, cv2.LINE_AA)

            cv2.putText(imgOrignal, str(round(probabilityValue*100, 2)) +
                        "%", (180, 75), font, 0.75, (255, 0, 0), 2, cv2.LINE_AA)
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


@app.route('/get_from_sql', methods=['GET'])
def get_from_sql():
    conn = sqlite3.connect('tokens.db')
    cursor = conn.cursor()

    # Retrieve the first token from the database
    cursor.execute('SELECT * FROM tokens LIMIT 1')
    token = cursor.fetchone()

    conn.close()

    if token:
        return jsonify({'token': {'id': token[0], 'tokenId': token[1]}})
    else:
        return jsonify({'message': 'No tokens available'})


@app.route('/add_to_sql', methods=['POST'])
def add_to_sql():
    new_token = request.json
    tokenId = new_token.get('tokenId')

    if not tokenId:
        return jsonify({'error': 'Token ID is required'}), 400

    conn = sqlite3.connect('tokens.db')
    cursor = conn.cursor()

    try:
        # Insert the new token into the database
        cursor.execute("INSERT INTO tokens (tokenId) VALUES (?)", (tokenId,))
        conn.commit()

        # Retrieve the inserted token ID
        token_id = cursor.lastrowid

        return jsonify({'success': True, 'id': token_id, 'tokenId': tokenId})

    except sqlite3.IntegrityError:
        return jsonify({'error': 'Token ID must be unique'}), 400

    finally:
        conn.close()


if __name__ == '__main__':
    app.after_request(add_cors_headers)
    app.run(port=4000, debug=True)
