import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Camera, CameraOff, Play, Square, Loader2, AlertCircle, Mic, Volume2, BarChart3 } from 'lucide-react';
import { SignLanguageService } from './services/signLanguageService.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const serviceRef = useRef(null);
  const recognitionIntervalRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recentRecognitions, setRecentRecognitions] = useState([]);
  const [error, setError] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [recognitionStats, setRecognitionStats] = useState({ totalRecognitions: 0, averageConfidence: 0, uniqueLetters: 0 });

  // Initialize the sign language service
  const initializeService = useCallback(async () => {
    if (serviceRef.current) return true;
    
    setIsInitializing(true);
    setError('');
    
    try {
      serviceRef.current = new SignLanguageService();
      const success = await serviceRef.current.initialize();
      
      if (!success) {
        throw new Error('Failed to initialize recognition service');
      }
      
      return true;
    } catch (err) {
      setError('Failed to initialize AI models. Please check your internet connection and try again.');
      console.error('Service initialization error:', err);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        
        // Initialize service when camera starts
        await initializeService();
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsRecording(false);
      
      // Clear recognition interval
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
        recognitionIntervalRef.current = null;
      }
    }
  };

  // Perform recognition on current video frame
  const performRecognition = useCallback(async () => {
    if (!serviceRef.current || !videoRef.current || !isRecording) {
      return;
    }

    try {
      const result = await serviceRef.current.recognizeFromVideo(videoRef.current);
      
      if (result && result.confidence > 0.7) {
        // Add recognized letter to text
        setRecognizedText(prev => {
          const newText = prev ? `${prev}${result.text}` : result.text;
          setTotalWords(newText.length);
          return newText.slice(-100); // Keep last 100 characters
        });
        setConfidence(result.confidence);
        
        // Update recent recognitions
        const recent = serviceRef.current.getRecentRecognitions(5);
        setRecentRecognitions(recent);
        
        // Update stats
        const stats = serviceRef.current.getRecognitionStats();
        setRecognitionStats(stats);
      }
    } catch (err) {
      console.error('Recognition error:', err);
      // Don't show error to user for individual recognition failures
    }
  }, [isRecording]);

  // Start/stop recording and recognition
  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
        recognitionIntervalRef.current = null;
      }
    } else {
      if (!serviceRef.current) {
        const initialized = await initializeService();
        if (!initialized) {
          setError('Cannot start recognition: AI service not available');
          return;
        }
      }
      
      setIsRecording(true);
      setRecognizedText('');
      setRecentRecognitions([]);
      setTotalWords(0);
      setRecognitionStats({ totalRecognitions: 0, averageConfidence: 0, uniqueLetters: 0 });
      
      // Start recognition loop - faster for real-time letter recognition
      recognitionIntervalRef.current = setInterval(performRecognition, 800); // Recognize every 800ms
    }
  };

  // Clear recognized text
  const clearText = () => {
    setRecognizedText('');
    setRecentRecognitions([]);
    setTotalWords(0);
    setConfidence(0);
    setRecognitionStats({ totalRecognitions: 0, averageConfidence: 0, uniqueLetters: 0 });
    if (serviceRef.current) {
      serviceRef.current.clearHistory();
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async () => {
    if (recognizedText) {
      try {
        await navigator.clipboard.writeText(recognizedText);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  // Add space to text
  const addSpace = () => {
    setRecognizedText(prev => prev + ' ');
    setTotalWords(prev => prev + 1);
  };

  // Remove last character
  const removeLastChar = () => {
    setRecognizedText(prev => prev.slice(0, -1));
    setTotalWords(prev => Math.max(0, prev - 1));
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (serviceRef.current) {
        serviceRef.current.dispose();
      }
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            ASL Alphabet Recognition
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Real-time American Sign Language alphabet recognition using AI
          </p>
          
          {/* Status indicators */}
          <div className="flex justify-center gap-4 flex-wrap">
            {isInitializing && (
              <div className="status-indicator initializing">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading AI models...</span>
              </div>
            )}
            
            {isStreaming && (
              <div className={`status-indicator ${isRecording ? 'recording' : 'stopped'}`}>
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{isRecording ? 'Recognizing' : 'Camera Active'}</span>
              </div>
            )}
            
            {recognitionStats.totalRecognitions > 0 && (
              <div className="status-indicator stopped">
                <BarChart3 className="w-4 h-4" />
                <span>{recognitionStats.totalRecognitions} letters • {recognitionStats.uniqueLetters} unique</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Video Feed Card */}
          <Card className="xl:col-span-2 shadow-xl card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Feed
                </div>
                {confidence > 0 && (
                  <div className="text-sm text-gray-500">
                    Confidence: {Math.round(confidence * 100)}%
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="camera-container aspect-video mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <CameraOff className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Camera not active</p>
                      <p className="text-sm opacity-75">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confidence bar */}
              {confidence > 0 && (
                <div className="confidence-indicator mb-4">
                  <span className="text-sm text-gray-600">Recognition Confidence:</span>
                  <div className="confidence-bar-container">
                    <div 
                      className="confidence-bar-fill"
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{Math.round(confidence * 100)}%</span>
                </div>
              )}
              
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button 
                    onClick={startCamera} 
                    className="flex-1 btn-primary" 
                    disabled={isInitializing}
                    size="lg"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera} 
                    variant="outline" 
                    className="flex-1 btn-secondary"
                    size="lg"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                )}
                
                {isStreaming && (
                  <Button 
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className={`flex-1 ${isRecording ? 'recording-indicator' : 'btn-primary'}`}
                    disabled={isInitializing}
                    size="lg"
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recognition
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Recognition
                      </>
                    )}
                  </Button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recognition Results Card */}
          <Card className="shadow-xl card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-green-600" />
                Recognized Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`recognition-area ${isRecording ? 'active' : ''}`}>
                {recognizedText ? (
                  <div className="space-y-3">
                    <p className="text-2xl font-mono text-gray-800 leading-relaxed text-appear tracking-wider">
                      {recognizedText}
                    </p>
                    {recognitionStats.averageConfidence > 0 && (
                      <div className="text-sm text-gray-600">
                        Average confidence: {Math.round(recognitionStats.averageConfidence * 100)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-base mb-2">No letters recognized yet</p>
                      <p className="text-sm">Start the camera and begin recognition</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Text controls */}
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={addSpace}
                  variant="outline" 
                  className="flex-1 btn-secondary"
                  disabled={!recognizedText}
                  size="sm"
                >
                  Add Space
                </Button>
                <Button 
                  onClick={removeLastChar}
                  variant="outline" 
                  className="flex-1 btn-secondary"
                  disabled={!recognizedText}
                  size="sm"
                >
                  Backspace
                </Button>
              </div>
              
              {recognizedText && (
                <div className="flex gap-2 mt-2">
                  <Button 
                    onClick={clearText}
                    variant="outline" 
                    className="flex-1 btn-secondary"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline" 
                    className="flex-1 btn-secondary"
                  >
                    Copy Text
                  </Button>
                </div>
              )}

              {/* Recent recognitions */}
              {recentRecognitions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Letters:</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {recentRecognitions.slice(-5).map((recognition, index) => (
                      <div key={index} className="recent-recognition text-center">
                        <div className="text-lg font-mono font-bold">{recognition.text}</div>
                        <div className="text-xs opacity-75">
                          {Math.round(recognition.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">How to Use ASL Alphabet Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="instructions">
              <ol className="space-y-3 text-gray-700">
                <li>Click "Start Camera" to enable your webcam</li>
                <li>Wait for the AI models to load (this may take a moment)</li>
                <li>Position your hand clearly in front of the camera with good lighting</li>
                <li>Click "Start Recognition" to begin recognizing ASL letters</li>
                <li>Form ASL alphabet letters with your hand - the system recognizes: A, B, C, D, E, F, G, H, I, L, O, U, V, W, Y</li>
                <li>Hold each letter steady for about 1 second for best recognition</li>
                <li>Use "Add Space" to separate words, "Backspace" to correct mistakes</li>
                <li>Copy your spelled text using the "Copy Text" button</li>
              </ol>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 mb-1">Real AI Models</p>
                    <p className="text-sm text-green-700">
                      This application now uses real trained AI models including MediaPipe Hands for hand detection and fingerpose for gesture recognition. 
                      The system can recognize 15 ASL alphabet letters with high accuracy in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;

