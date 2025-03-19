// components/BallTracker.js
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Svg, Circle, Path, G, Line } from 'react-native-svg';

// Maximum number of positions to keep in history
const MAX_HISTORY = 30;
// Fade time in milliseconds for the trail
const TRAIL_FADE_TIME = 1000;
// Color to match the training mat
const TRAIL_COLOR = '#40E0D0';

const BallTracker = ({ ballPositions, screenWidth, screenHeight }) => {
  const [normalizedPositions, setNormalizedPositions] = useState([]);

  // Process and normalize positions whenever they change
  useEffect(() => {
    if (!ballPositions.length || !screenWidth || !screenHeight) return;

    // Add current timestamp to each position for fading effects
    const now = Date.now();
    
    // Create normalized positions (keeping only the last MAX_HISTORY)
    const normalized = ballPositions
      .slice(-MAX_HISTORY)
      .map(pos => ({
        x: pos.x,
        y: pos.y,
        time: pos.time,
        // Calculate opacity based on time (newer positions are more opaque)
        opacity: Math.min(1, (now - pos.time) / TRAIL_FADE_TIME)
      }));
    
    setNormalizedPositions(normalized);
  }, [ballPositions, screenWidth, screenHeight]);

  // If no positions or dimensions, don't render anything
  if (!normalizedPositions.length || !screenWidth || !screenHeight) {
    return null;
  }

  // Generate SVG path for the ball trail
  const generatePath = () => {
    if (normalizedPositions.length < 2) return '';
    
    return normalizedPositions.reduce((path, point, i) => {
      return path + (i === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');
  };

  // Get the most recent position for the current ball indicator
  const currentPosition = normalizedPositions[normalizedPositions.length - 1];

  return (
    <Svg style={[StyleSheet.absoluteFill, styles.svg]} width={screenWidth} height={screenHeight}>
      {/* Ball trail path */}
      <Path
        d={generatePath()}
        stroke={TRAIL_COLOR}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Previous positions as dots with fading opacity */}
      {normalizedPositions.slice(0, -1).map((pos, index) => (
        <Circle
          key={`pos-${index}`}
          cx={pos.x}
          cy={pos.y}
          r={4}
          fill={TRAIL_COLOR}
          opacity={1 - pos.opacity}
        />
      ))}
      
      {/* Current ball position */}
      {currentPosition && (
        <Circle
          cx={currentPosition.x}
          cy={currentPosition.y}
          r={12}
          fill="white"
          stroke="#FF4500"
          strokeWidth={3}
        />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default BallTracker;