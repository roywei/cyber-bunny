from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import time
from jetbot import Robot,Camera, bgr8_to_jpeg

app = Flask(__name__)
CORS(app)
robot = Robot()
camera = Camera.instance()

def generate_frames():
    while True:
        frame = camera.value
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/capture')
def capture():
    frame = camera.value  # Capture frame-by-frame
    _, buffer = cv2.imencode('.jpg', frame)
    return Response(buffer.tobytes(), mimetype='image/jpeg')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/move_forward', methods=['POST'])
def move_forward():
    speed = float(request.json.get('speed', 0.3))
    duration = float(request.json.get('time', 0.5))
    robot.forward(speed)
    time.sleep(duration)
    robot.stop()
    return jsonify({'status': 'moved forward'})

@app.route('/move_backward', methods=['POST'])
def move_backward():
    speed = float(request.json.get('speed', 0.3))
    duration = float(request.json.get('time', 0.5))
    robot.backward(speed)
    time.sleep(duration)
    robot.stop()
    return jsonify({'status': 'moved backward'})

@app.route('/turn_left', methods=['POST'])
def turn_left():
    speed = float(request.json.get('speed', 0.3))
    duration = float(request.json.get('time', 0.5))
    robot.left(speed)
    time.sleep(duration)
    robot.stop()
    return jsonify({'status': 'turned left'})

@app.route('/turn_right', methods=['POST'])
def turn_right():
    speed = float(request.json.get('speed', 0.3))
    duration = float(request.json.get('time', 0.5))
    robot.right(speed)
    time.sleep(duration)
    robot.stop()
    return jsonify({'status': 'turned right'})

@app.route('/stop', methods=['GET'])
def stop():
    robot.stop()
    return jsonify({'status': 'stopped'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)