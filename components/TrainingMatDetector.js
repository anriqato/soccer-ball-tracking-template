// components/TrainingMatDetector.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as tf from '@tensorflow/tfjs';

// This component will overlay numbered zones matching the physical training mat
const TrainingMatDetector = ({ imageSize, ballPosition, isCalibrated = false }) => {
  // Define mat zones based on the training mat in the image
  // In a real implementation, these would be calibrated during setup
  const [matZones, setMatZones] = useState({
    // Based on the image, approximate positions for each numbered zone
    // The values are percentages of the screen size
    1: { x: 0.5, y: 0.8, radius: 0.05 },  // Bottom middle
    2: { x: 0.2, y: 0.8, radius: 0.05 },  // Bottom left
    3: { x: 0.2, y: 0.2, radius: 0.05 },  // Top left
    4: { x: 0.5, y: 0.2, radius: 0.05 },  // Top middle
    5: { x: 0.8, y: 0.2, radius: 0.05 },  // Top right
    6: { x: 0.8, y: 0.8, radius: 0.05 },  // Bottom right
  });

  // Track which zone the ball is currently in
  const [currentZone, setCurrentZone] = useState(null);

  // Check if the ball is in any of the zones
  useEffect(() => {
    if (!ballPosition || !imageSize) return;
    
    // Normalize ball position to screen percentage
    const normalizedBallX = ballPosition.x / imageSize.width;
    const normalizedBallY = ballPosition.y / imageSize.height;
    
    // Check each zone
    let detectedZone = null;
    Object.entries(matZones).forEach(([zoneNumber, zone]) => {
      // Calculate distance from zone center to ball
      const distance = Math.sqrt(
        Math.pow(normalizedBallX - zone.x, 2) + 
        Math.pow(normalizedBallY - zone.y, 2)
      );
      
      // If ball is within zone radius
      if (distance < zone.radius) {
        detectedZone = zoneNumber;
      }
    });
    
    setCurrentZone(detectedZone);
  }, [ballPosition, imageSize, matZones]);

  // If not calibrated, show a simple message
  if (!isCalibrated) {
    return (
      <View style={styles.uncalibratedContainer}>
        <Text style={styles.uncalibratedText}>
          Place the phone camera over the training mat to begin
        </Text>
      </View>
    );
  }

  // Render the overlay zones
  return (
    <View style={StyleSheet.absoluteFill}>
      {Object.entries(matZones).map(([zoneNumber, zone]) => (
        <View
          key={zoneNumber}
          style={[
            styles.zoneMarker,
            {
              left: `${zone.x * 100}%`,
              top: `${zone.y * 100}%`,
              width: `${zone.radius * 200}%`,
              height: `${zone.radius * 200}%`,
              transform: [
                { translateX: -25 },
                { translateY: -25 }
              ],
              backgroundColor: currentZone === zoneNumber ? 'rgba(64, 224, 208, 0.5)' : 'rgba(255, 255, 255, 0.2)',
            }
          ]}
        >
          <Text style={styles.zoneText}>{zoneNumber}</Text>
        </View>
      ))}
      
      {currentZone && (
        <View style={styles.zoneIndicator}>
          <Text style={styles.zoneIndicatorText}>
            Ball in zone: {currentZone}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  zoneMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40E0D0',
  },
  zoneText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  zoneIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 5,
  },
  zoneIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  uncalibratedContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uncalibratedText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default TrainingMatDetector;