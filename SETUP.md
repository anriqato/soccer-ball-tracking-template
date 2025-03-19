# Setup Instructions for Soccer Ball Tracking POC

Follow these step-by-step instructions to set up the Soccer Ball Tracking POC on your device.

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation Steps

1. **Clone this repository**:
   ```bash
   git clone https://github.com/anriqato/soccer-ball-tracking-template.git
   cd soccer-ball-tracking-template
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or if you use yarn:
   # yarn install
   ```

3. **Start the Expo development server**:
   ```bash
   npm start
   # or
   # expo start
   ```

4. **Run on a device**:
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code displayed in the terminal or browser
   - Alternatively, press 'a' to run on Android emulator or 'i' to run on iOS simulator

## Common Issues and Troubleshooting

### TensorFlow.js Installation Issues

If you encounter issues with TensorFlow.js installation:

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### Expo Camera Permissions

If camera permissions aren't working properly:
- Make sure your device has granted camera permissions to the Expo Go app
- On Android, check app permissions in Settings
- On iOS, you may need to go to Settings > Privacy > Camera

### Performance Issues

If the app runs slowly:
- Reduce the camera resolution in App.js by modifying the resizeWidth and resizeHeight values
- Increase the frame skip count by changing the "frameCount % 3" check to a higher number

## Using Your Own Training Mat

The app is configured to recognize a training mat with numbers 1-6 positioned as shown in the training mat image. If you have a different training mat layout:

1. Modify the `matZones` object in `components/TrainingMatDetector.js` to match your mat's layout
2. Adjust the colors in the app to match your mat's color scheme by changing the `TEAL_COLOR` constant in `App.js`

## Next Steps

After testing the basic functionality, you can:
1. Improve ball detection by training a custom TensorFlow.js model
2. Enhance the mat detection with perspective correction
3. Add analytics to track user performance
4. Implement user profiles and training programs