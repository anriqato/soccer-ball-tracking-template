# Soccer Ball Tracking POC with React Native + Expo

This proof-of-concept application demonstrates tracking a soccer ball using a mobile device camera and recognizing its position relative to a physical training mat.

## Features

- Real-time soccer ball detection using TensorFlow.js and COCO-SSD
- Ball tracking with visual path/trail
- Training mat zone recognition
- Cross-platform support (iOS & Android)

## Installation

1. Make sure you have Node.js and npm installed
2. Install Expo CLI globally:
   ```
   npm install -g expo-cli
   ```
3. Clone this repository or create a new project following these steps:
   ```
   expo init SoccerBallTrackingPOC
   cd SoccerBallTrackingPOC
   ```
4. Install the required dependencies:
   ```
   npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/coco-ssd expo-camera expo-gl expo-gl-cpp react-native-svg expo-file-system @react-native-async-storage/async-storage expo-asset
   ```

## Project Structure

- **App.js**: Main application component
- **components/**
  - **BallTracker.js**: Handles visualizing the ball's path
  - **TrainingMatDetector.js**: Recognizes and overlays training mat zones
- **utils/**
  - **TensorflowUtils.js**: Helper functions for TensorFlow.js

## Usage

1. Start the development server:
   ```
   npm start
   ```
2. Open the Expo Go app on your device and scan the QR code
3. Position your device so the camera can see both the soccer ball and training mat
4. Press "Calibrate Mat" to recognize the training mat
5. Press "Start Tracking" to begin tracking the ball's movement

## Key Technical Components

- **TensorFlow.js / COCO-SSD**: Used for object detection to identify the soccer ball
- **React Native Camera**: Provides access to the device camera
- **SVG Visualization**: Renders the ball's path and training zones as overlays

## Limitations of the POC

- Basic mat detection (would need refinement for production)
- Limited to detecting standard soccer balls
- Performs best in good lighting conditions
- May have performance issues on older devices

## Next Steps for Production

1. Improve training mat detection with perspective correction
2. Add custom model training for better ball detection in various conditions
3. Implement trajectory prediction using Kalman filtering
4. Add user profiles and training program features
5. Optimize performance for weaker devices
6. Add web support via React Native Web

## Requirements

- Expo SDK 48 or newer
- iOS 13+ or Android 8+
- Device with camera access

## License

This project is for demonstration purposes only.
