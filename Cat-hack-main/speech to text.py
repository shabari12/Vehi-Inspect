
import os
import time
import cv2
import mediapipe as mp
import speech_recognition as sr

# Suppress most TensorFlow logging messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)

# Initialize MediaPipe Drawing
mp_drawing = mp.solutions.drawing_utils

# Define a function to recognize hand gestures
def recognize_gesture(image):
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Draw hand landmarks
            mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            # Get the landmarks for the thumb and index finger
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
            thumb_ip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_IP]
            thumb_mcp = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_MCP]
            wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
            
            # Calculate vectors
            thumb_vector = (thumb_tip.x - wrist.x, thumb_tip.y - wrist.y)

            # Determine if thumb is up or down
            if thumb_vector[1] < 0 and abs(thumb_vector[0]) < abs(thumb_vector[1]) * 0.5:
                return "Thumbs Up"
            elif thumb_vector[1] > 0 and abs(thumb_vector[0]) < abs(thumb_vector[1]) * 0.5:
                return "Thumbs Down"

    return "No Gesture"

# Define a function for speech-to-text conversion
def speech_to_text():
    # Initialize the recognizer
    recognizer = sr.Recognizer()
    
    # Use the default microphone as the audio source
    with sr.Microphone() as mic:
        try:
            # Adjust for ambient noise and set pause threshold
            recognizer.adjust_for_ambient_noise(mic, duration=1)  # Calibrate for ambient noise for 1 second
            recognizer.pause_threshold = 0.8  # Shorter pause threshold to detect end of speech more quickly
            recognizer.dynamic_energy_threshold = True
            print("Listening...")

            # Capture the audio from the microphone
            audio = recognizer.listen(mic, timeout=10)  # Shortened timeout
            
            print("Recognizing...")
            
            # Recognize the speech using Google's web service
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

# Initialize the webcam
cap = cv2.VideoCapture(0)

# List of questions for the technician
questions = [
    "TIRE PRESSURE for Left Front:",
    "TIRE PRESSURE for Right Front:",
    "TIRE CONDITION for Left Front (Good, Ok, Needs Replacement) (Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "TIRE CONDITION for Right Front (Good, Ok, Needs Replacement)(Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "TIRE PRESSURE for Left Rear:",
    "TIRE PRESSURE for Right Rear:",
    "TIRE CONDITION for Left Rear (Good, Ok, Needs Replacement)(Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "TIRE CONDITION for Right Rear (Good, Ok, Needs Replacement)(Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    
    "BATTERY Make (Example CAT, ABC, XYZ etc):",
    "BATTERY Water level (Good, Ok, Low):",
    "BATTERY Replacement date:",
    "BATTERY Voltage:",
    "Condition of BATTERY (Any damage) Y/N. If yes, attach image:",
    "Any Leak / Rust in BATTERY (Y/N):",
    
    "Rust, Dent or Damage to EXTERIOR (Y/N, If yes, explain in notes and attach images):",
    "Oil leak in SUSPENSION (Y/N):",
"BRAKE Fluid level (Good, Ok, Low):",
    "BRAKE CONDITION for Front (Good, Ok, Needs Replacement)(Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "BRAKE CONDITION for Rear (Good, Ok, Needs Replacement)(Good-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "Emergency BRAKE (Good, Ok, Low):",

    "Rust, Dents or Damage in ENGINE (Y/N, If yes, explain in notes and attach images):",
    "ENGINE Oil Condition (Good / Bad):",
    "ENGINE Oil Color (Clean / Brown / Black etc)(CLEAN-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "BRAKE Fluid Condition (Good / Bad):",
    "BRAKE Fluid Color (Clean / Brown / Black etc)(CLEAN-THUMBS UP, ANY OTHER-THUMBS DOWN):",
    "Any oil leak in ENGINE (Y/N):",
   

]

# Loop through each question
for question in questions:
    print(question)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gesture = recognize_gesture(frame)

        # Display the result
        cv2.putText(frame, gesture, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.imshow('Webcam', frame)

        # If the gesture is recognized, act accordingly
        if gesture == "Thumbs Down":
            print("FAIL")
            text = speech_to_text()
            print(f"Final Output: {text}")
            break
        elif gesture == "Thumbs Up":
            print("PASS")
            time.sleep(4)  # Wait for 4 seconds before moving to the next question
            break

        # Exit when 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cap.release()
            cv2.destroyAllWindows()
            hands.close()
            exit()

cap.release()
cv2.destroyAllWindows()
hands.close()