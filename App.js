// App.js - Main entry point for our React Native application
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Svg, Circle, Path, G } from 'react-native-svg';

// Import our custom components
import BallTracker from './components/BallTracker';
import TrainingMatDetector from './components/TrainingMatDetector';
import { initTensorFlow, cleanupTensorflow, detectBall } from './utils/TensorflowUtils';

// TensorCamera is a wrapper for Camera that allows us to use TF.js
const TensorCamera = cameraWithTensors(Camera);

// Colors to match your training mat
const TEAL_COLOR = '#40E0D0';
const BLACK_COLOR = '#000000';

export default function App() {
  // Screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // State management
  const [hasPermission, setHasPermission] = useState(null);
  const [model, setModel] = useState(null);
  const [ballPositions, setBallPositions] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [isMatCalibrated, setIsMatCalibrated] = useState(false);
  const [tensorDims, setTensorDims] = useState({ width: 300, height: 300 });
  const cameraRef = useRef(null);

  // Request camera permissions and load TensorFlow model
  useEffect(() => {
    (async () => {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      // Initialize TensorFlow.js
      const tfReady = await initTensorFlow();
      if (!tfReady) {
        Alert.alert('Error', 'Failed to initialize TensorFlow.js');
        return;
      }

      // Load COCO-SSD model - better for object detection than MobileNet
      try {
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        console.log('COCO-SSD model loaded');
      } catch (error) {
        console.error('Failed to load model', error);
        Alert.alert('Error', 'Failed to load object detection model.');
      }
    })();

    // Cleanup
    return () => {
      setIsTracking(false);
      cleanupTensorflow();
    };
  }, []);

  // Handle frames from the camera
  const handleCameraStream = (images) => {
    const loop = async () => {
      if (!model) return;
      
      // Get the current tensor frame
      const nextImageTensor = images.next().value;
      if (!nextImageTensor) return;

      try {
        // Set tensor dimensions for scaling
        if (frameCount === 0) {
          const [height, width] = nextImageTensor.shape.slice(0, 2);
          setTensorDims({ width, height });
        }
        
        // Only process every 3rd frame for performance
        setFrameCount(prev => prev + 1);
        if (frameCount % 3 === 0 && isTracking) {
          // Run object detection
          const predictions = await model.detect(nextImageTensor);
          
          // Look for ball predictions
          const ballPrediction = predictions.find(
            prediction => (prediction.class === 'sports ball' || prediction.class === 'ball') && prediction.score > 0.65
          );

          if (ballPrediction) {
            // Calculate center of the detected ball
            const centerX = ballPrediction.bbox[0] + ballPrediction.bbox[2] / 2;
            const centerY = ballPrediction.bbox[1] + ballPrediction.bbox[3] / 2;
            
            // Scale coordinates from tensor dimensions to screen dimensions
            const scaledX = (centerX / tensorDims.width) * screenWidth;
            const scaledY = (centerY / tensorDims.height) * screenHeight;
            
            // Add position to our tracking array, limiting to last 30 positions
            setBallPositions(prev => {
              const newPositions = [...prev, { x: scaledX, y: scaledY, time: Date.now() }];
              return newPositions.slice(Math.max(0, newPositions.length - 30));
            });
          }
        }
        
        // Check for training mat after a few frames, regardless of tracking state
        if (frameCount === 10 && !isMatCalibrated) {
          // In a full implementation, we would detect the training mat here
          // For POC, we'll just set it to true after a delay
          setTimeout(() => {
            setIsMatCalibrated(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error processing frame:', error);
      } finally {
        // Dispose of tensor to free memory
        tf.dispose(nextImageTensor);
      }

      // Continue the loop
      requestAnimationFrame(loop);
    };

    loop();
  };

  // Start/stop tracking
  const toggleTracking = () => {
    if (!isTracking) {
      // Clear previous positions when starting new tracking
      setBallPositions([]);
    }
    setIsTracking(!isTracking);
  };

  // Reset tracking data
  const resetTracking = () => {
    setBallPositions([]);
  };
  
  // Calibrate the training mat
  const calibrateMat = () => {
    // In a real implementation, this would initiate a calibration sequence
    // For our POC, we'll just toggle the calibration state
    setIsMatCalibrated(!isMatCalibrated);
  };

  // If we don't have camera permission yet
  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  // Main render
  return (
    <View style={styles.container}>
      {/* Camera component with TensorFlow.js */}
      <View style={styles.cameraContainer}>
        {model ? (
          <TensorCamera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.back}
            autorender={true}
            resizeWidth={300}
            resizeHeight={300}
            resizeDepth={3}
            onReady={handleCameraStream}
            useCustomShadersToResize={false}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading TensorFlow model...</Text>
          </View>
        )}
        
        {/* Ball Tracker Component */}
        {isTracking && (
          <BallTracker 
            ballPositions={ballPositions} 
            screenWidth={screenWidth} 
            screenHeight={screenHeight} 
          />
        )}
        
        {/* Training Mat Detector */}
        <TrainingMatDetector 
          imageSize={{ width: screenWidth, height: screenHeight }} 
          ballPosition={ballPositions.length > 0 ? ballPositions[ballPositions.length - 1] : null}
          isCalibrated={isMatCalibrated}
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.button, isTracking ? styles.stopButton : styles.startButton]} 
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, isMatCalibrated ? styles.calibratedButton : styles.calibrateButton]} 
          onPress={calibrateMat}
        >
          <Text style={styles.buttonText}>
            {isMatCalibrated ? 'Mat Calibrated' : 'Calibrate Mat'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetTracking}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {model ? (isTracking ? 'Tracking Active' : 'Ready') : 'Loading Model...'}
        </Text>
        <Text style={styles.statusText}>
          Ball Detected: {ballPositions.length > 0 && 
            Date.now() - ballPositions[ballPositions.length - 1].time < 1000 ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.statusText}>
          Mat Calibrated: {isMatCalibrated ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#111',
  },
  button: {
    padding: 12,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  calibrateButton: {
    backgroundColor: '#2196F3',
  },
  calibratedButton: {
    backgroundColor: '#3F51B5',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    minWidth: 80,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusContainer: {
    padding: 10,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#fff',
  },
});