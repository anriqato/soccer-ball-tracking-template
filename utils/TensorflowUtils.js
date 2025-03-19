// utils/TensorflowUtils.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import { Asset } from 'expo-asset';

// Initialize TensorFlow.js
export const initTensorFlow = async () => {
  try {
    await tf.ready();
    console.log('TensorFlow.js is ready');
    return true;
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js', error);
    return false;
  }
};

// Prepare image for processing with TensorFlow.js
export const processImage = async (imageAssetPath) => {
  try {
    // Load image
    const asset = Asset.fromModule(imageAssetPath);
    await asset.downloadAsync();
    
    // Read image data
    const imageUri = asset.localUri || asset.uri;
    const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Decode and process the image data
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer);
    const imageTensor = decodeJpeg(raw);
    
    // Normalize and resize if needed
    const normalized = tf.tidy(() => {
      return tf.image.resizeBilinear(imageTensor, [224, 224])
        .toFloat()
        .div(tf.scalar(255))
        .expandDims(0);
    });
    
    tf.dispose(imageTensor);
    return normalized;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
};

// Color detection helper to identify training mat (based on the teal/cyan color)
export const detectMatColors = (tensor) => {
  // Define color range for teal/cyan detection
  // The values should be calibrated based on actual mat color
  const lowTeal = tf.tensor1d([0, 180/255, 180/255]); // Lower HSV range
  const highTeal = tf.tensor1d([0.3, 1, 1]); // Upper HSV range
  
  return tf.tidy(() => {
    // Convert RGB to HSV for better color detection
    const frameRGB = tensor.squeeze();
    
    // Simple HSV conversion logic (simplified for demonstration)
    // In a real application, use a proper RGB to HSV conversion
    // This is just a placeholder for the concept
    
    // Check each pixel for the teal color range
    // Again, this is a simplified approach for demonstration
    
    return frameRGB; // Return the original tensor for now
  });
};

// Soccer ball detection using COCO-SSD model
export const detectBall = async (model, imageTensor) => {
  if (!model || !imageTensor) return null;
  
  try {
    const predictions = await model.detect(imageTensor);
    
    // Find the first prediction that's a sports ball with high confidence
    const ballPrediction = predictions.find(
      pred => (pred.class === 'sports ball' || pred.class === 'ball') && pred.score > 0.7
    );
    
    return ballPrediction;
  } catch (error) {
    console.error('Error detecting ball:', error);
    return null;
  }
};

// Clean up TensorFlow resources
export const cleanupTensorflow = () => {
  try {
    // Dispose of all tensors to prevent memory leaks
    tf.disposeVariables();
    console.log('TensorFlow resources cleaned up');
  } catch (error) {
    console.error('Error cleaning up TensorFlow resources:', error);
  }
};