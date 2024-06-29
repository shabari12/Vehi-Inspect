import os
import time
import cv2
import mediapipe as mp
import speech_recognition as sr
from flask import Flask, jsonify, Response, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

# Suppress most TensorFlow logging messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# Function to recognize hand gestures
def recognize_gesture(image):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
            wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
            thumb_vector = (thumb_tip.x - wrist.x, thumb_tip.y - wrist.y)

            if thumb_vector[1] < 0 and abs(thumb_vector[0]) < abs(thumb_vector[1]) * 0.5:
                return "Thumbs Up"
            elif thumb_vector[1] > 0 and abs(thumb_vector[0]) < abs(thumb_vector[1]) * 0.5:
                return "Thumbs Down"
    return "No Gesture"

# Function for speech-to-text conversion
def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as mic:
        try:
            recognizer.adjust_for_ambient_noise(mic, duration=1)
            recognizer.pause_threshold = 0.8
            recognizer.dynamic_energy_threshold = True
            print("Listening...")
            audio = recognizer.listen(mic, timeout=10)
            print("Recognizing...")
            text = recognizer.recognize_google(audio)
            print(f"Recognized Text: {text}")
            return text
        except sr.WaitTimeoutError:
            print("Listening timed out while waiting for phrase to start")
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand the audio")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return ""

# Route to start gesture recognition process
@app.route('/api/start-process')
def start_process():
    return jsonify({'message': 'Gesture recognition process started'})

# Route to serve video feed with gesture recognition
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def gen_frames():
    cap = cv2.VideoCapture(0)
    questions = [
        "TIRE CONDITION for Left Front",
        "TIRE CONDITION for Right Front",
        "TIRE PRESSURE for Left Rear",
        "TIRE PRESSURE for Right Rear",
        "TIRE CONDITION for Left Rear",
        "TIRE CONDITION for Right Rear",
        "BATTERY Make",
        "BATTERY Water level",
        "BATTERY Replacement date",
        "BATTERY Voltage",
        "Condition of BATTERY",
        "Any Leak / Rust in BATTERY",
        "Rust, Dent or Damage to EXTERIOR",
        "Oil leak in SUSPENSION",
        "BRAKE Fluid level",
        "BRAKE CONDITION for Front",
        "BRAKE CONDITION for Rear",
        "Emergency BRAKE",
        "Rust, Dents or Damage in ENGINE",
        "ENGINE Oil Condition",
        "ENGINE Oil Color",
        "BRAKE Fluid Condition",
        "BRAKE Fluid Color",
        "Any oil leak in ENGINE",
    ]
    current_question = 0
    while True:
        success, frame = cap.read()
        if not success:
            break
        gesture = recognize_gesture(frame)
        cv2.putText(frame, gesture, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        if gesture == "Thumbs Down":
            result = "Fail"
            print(f"Question: {questions[current_question]}")
            print("FAIL")
            text = speech_to_text()
            print(f"Recognized Text: {text}")
            socketio.emit('question_answer', {'question': questions[current_question], 'answer': 'Fail', 'reason': text})
            current_question += 1
        elif gesture == "Thumbs Up":
            result = "Pass"
            print(f"Question: {questions[current_question]}")
            print("PASS")
            socketio.emit('question_answer', {'question': questions[current_question], 'answer': 'Pass'})
            current_question += 1
            time.sleep(4)
        if current_question >= len(questions):
            break
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

if __name__ == "__main__":
    socketio.run(app, debug=True)
