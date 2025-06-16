import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as handpose from '@tensorflow-models/handpose';
import { GestureEstimator, Finger, FingerCurl, FingerDirection } from 'fingerpose';

// Helper function for retries
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Real sign language recognition using TensorFlow.js and MediaPipe
export class SignLanguageRecognizer {
  constructor() {
    this.handPoseModel = null;
    this.gestureEstimator = null;
    this.isLoaded = false;
    this.setupGestureEstimator();
  }

  setupGestureEstimator() {
    // Create gesture estimator for sign language recognition
    this.gestureEstimator = new GestureEstimator([
      // Define common ASL gestures
      this.createGesture('A', [
        [Finger.Thumb, FingerCurl.NoCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),
      
      this.createGesture('B', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalUp],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Pinky, FingerCurl.NoCurl, FingerDirection.VerticalUp]
      ]),

      this.createGesture('C', [
        [Finger.Thumb, FingerCurl.HalfCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.HalfCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.HalfCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.HalfCurl, FingerDirection.VerticalUp],
        [Finger.Pinky, FingerCurl.HalfCurl, FingerDirection.VerticalUp]
      ]),

      this.createGesture('D', [
        [Finger.Thumb, FingerCurl.HalfCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('E', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('F', [
        [Finger.Thumb, FingerCurl.HalfCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Pinky, FingerCurl.NoCurl, FingerDirection.VerticalUp]
      ]),

      this.createGesture('G', [
        [Finger.Thumb, FingerCurl.NoCurl, FingerDirection.HorizontalRight],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.HorizontalRight],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('H', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.HorizontalRight],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.HorizontalRight],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('I', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.NoCurl, FingerDirection.VerticalUp]
      ]),

      this.createGesture('L', [
        [Finger.Thumb, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('O', [
        [Finger.Thumb, FingerCurl.HalfCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('U', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('V', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('W', [
        [Finger.Thumb, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Index, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Middle, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Ring, FingerCurl.NoCurl, FingerDirection.VerticalUp],
        [Finger.Pinky, FingerCurl.FullCurl, FingerDirection.VerticalDown]
      ]),

      this.createGesture('Y', [
        [Finger.Thumb, FingerCurl.NoCurl, FingerDirection.DiagonalUpRight],
        [Finger.Index, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Middle, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Ring, FingerCurl.FullCurl, FingerDirection.VerticalDown],
        [Finger.Pinky, FingerCurl.NoCurl, FingerDirection.VerticalUp]
      ])
    ]);
  }

  createGesture(name, fingerPoses) {
    const gesture = {
      name,
      curls: {},
      directions: {}
    };

    fingerPoses.forEach(([finger, curl, direction]) => {
      gesture.curls[finger] = [curl];
      gesture.directions[finger] = [direction];
    });

    return gesture;
  }

  async loadModel() {
    try {
      console.log('Loading hand pose detection model...');
      
      // Load MediaPipe Hands model with retry mechanism
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: 'full',
        maxHands: 2,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      };

      this.handPoseModel = await retry(() => handPoseDetection.createDetector(model, detectorConfig));
      this.isLoaded = true;
      
      console.log('Hand pose detection model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading hand pose model:', error);
      
      // Fallback to legacy handpose model
      try {
        console.log('Falling back to legacy handpose model...');
        this.handPoseModel = await retry(() => handpose.load());
        this.isLoaded = true;
        console.log('Legacy handpose model loaded successfully');
        return true;
      } catch (fallbackError) {
        console.error('Error loading fallback model:', fallbackError);
        return false;
      }
    }
  }

  async predict(imageElement) {
    if (!this.isLoaded || !this.handPoseModel) {
      throw new Error('Model not loaded');
    }

    try {
      // Detect hands in the image
      const hands = await this.handPoseModel.estimateHands(imageElement);
      
      if (hands.length === 0) {
        return {
          label: '',
          confidence: 0,
          landmarks: null
        };
      }

      // Get the first detected hand
      const hand = hands[0];
      const landmarks = hand.keypoints || hand.landmarks;

      if (!landmarks || landmarks.length < 21) {
        return {
          label: '',
          confidence: 0,
          landmarks: landmarks
        };
      }

      // Convert landmarks to fingerpose format
      const fingerPoseLandmarks = this.convertToFingerPoseLandmarks(landmarks);
      
      // Estimate gesture using fingerpose
      const gestureEstimation = this.gestureEstimator.estimate(fingerPoseLandmarks, 8.5);
      
      if (gestureEstimation.gestures.length > 0) {
        const bestGesture = gestureEstimation.gestures[0];
        return {
          label: bestGesture.name,
          confidence: bestGesture.score,
          landmarks: landmarks
        };
      }

      return {
        label: '',
        confidence: 0,
        landmarks: landmarks
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  convertToFingerPoseLandmarks(landmarks) {
    // Convert TensorFlow.js landmarks to fingerpose format
    return landmarks.map(landmark => [landmark.x, landmark.y, landmark.z || 0]);
  }

  dispose() {
    if (this.handPoseModel && this.handPoseModel.dispose) {
      this.handPoseModel.dispose();
    }
    this.handPoseModel = null;
    this.isLoaded = false;
  }
}

// Enhanced hand detection service
export class HandDetector {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing enhanced hand detector...');
      
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: 'full',
        maxHands: 2,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.7
      };

      this.detector = await retry(() => handPoseDetection.createDetector(model, detectorConfig));
      this.isInitialized = true;
      
      console.log('Enhanced hand detector initialized');
      return true;
    } catch (error) {
      console.error('Error initializing hand detector:', error);
      return false;
    }
  }

  async detectHands(imageElement) {
    if (!this.isInitialized || !this.detector) {
      throw new Error('Hand detector not initialized');
    }

    try {
      const hands = await this.detector.estimateHands(imageElement);
      
      return {
        hands: hands,
        count: hands.length,
        landmarks: hands.map(hand => hand.keypoints || hand.landmarks),
        handedness: hands.map(hand => hand.handedness || 'Unknown')
      };
    } catch (error) {
      console.error('Hand detection error:', error);
      throw error;
    }
  }

  dispose() {
    if (this.detector && this.detector.dispose) {
      this.detector.dispose();
    }
    this.detector = null;
    this.isInitialized = false;
  }
}

// Enhanced sign language service with real models
export class SignLanguageService {
  constructor() {
    this.recognizer = new SignLanguageRecognizer();
    this.handDetector = new HandDetector();
    this.isReady = false;
    this.recognitionHistory = [];
    this.lastRecognitionTime = 0;
    this.recognitionCooldown = 500; // 500ms cooldown between recognitions
  }

  async initialize() {
    try {
      console.log('Initializing enhanced sign language service...');
      
      const [modelLoaded, detectorInitialized] = await Promise.all([
        this.recognizer.loadModel(),
        this.handDetector.initialize()
      ]);

      this.isReady = modelLoaded && detectorInitialized;
      
      if (this.isReady) {
        console.log('Enhanced sign language service ready with real models');
      } else {
        console.error('Failed to initialize sign language service');
      }
      
      return this.isReady;
    } catch (error) {
      console.error('Service initialization error:', error);
      return false;
    }
  }

  async recognizeFromVideo(videoElement) {
    if (!this.isReady) {
      throw new Error('Service not ready');
    }

    // Implement cooldown to prevent too frequent recognition
    const now = Date.now();
    if (now - this.lastRecognitionTime < this.recognitionCooldown) {
      return null;
    }

    try {
      // Create canvas to capture frame from video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get predictions from the recognizer
      const prediction = await this.recognizer.predict(canvas);
      
      // Only process if we have a confident prediction
      if (prediction.confidence > 0.7 && prediction.label) {
        const result = {
          text: prediction.label,
          confidence: prediction.confidence,
          timestamp: now,
          landmarks: prediction.landmarks
        };

        this.recognitionHistory.push(result);
        this.lastRecognitionTime = now;
        
        // Keep only last 20 results
        if (this.recognitionHistory.length > 20) {
          this.recognitionHistory.shift();
        }

        return result;
      }

      return null;
    } catch (error) {
      console.error('Recognition error:', error);
      throw error;
    }
  }

  getRecentRecognitions(count = 5) {
    return this.recognitionHistory.slice(-count);
  }

  getRecognitionStats() {
    if (this.recognitionHistory.length === 0) {
      return { totalRecognitions: 0, averageConfidence: 0, uniqueLetters: 0 };
    }

    const totalRecognitions = this.recognitionHistory.length;
    const averageConfidence = this.recognitionHistory.reduce((sum, r) => sum + r.confidence, 0) / totalRecognitions;
    const uniqueLetters = new Set(this.recognitionHistory.map(r => r.text)).size;

    return {
      totalRecognitions,
      averageConfidence,
      uniqueLetters
    };
  }

  clearHistory() {
    this.recognitionHistory = [];
    this.lastRecognitionTime = 0;
  }

  dispose() {
    this.recognizer.dispose();
    this.handDetector.dispose();
    this.isReady = false;
    this.recognitionHistory = [];
  }
}

