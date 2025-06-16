# Sign Language to Text Translator

## Overview
This project is a web-based application designed to translate American Sign Language (ASL) alphabet gestures into text in real-time. It leverages advanced machine learning models, specifically MediaPipe Hands and Fingerpose, to detect hand landmarks and interpret them as ASL letters. The application aims to provide a practical tool for communication and learning, demonstrating the power of on-device AI for accessibility.

## Features

### Real-time ASL Alphabet Recognition
The core feature of this application is its ability to recognize 15 specific ASL alphabet letters in real-time from a live camera feed. The recognized letters include: **A, B, C, D, E, F, G, H, I, L, O, U, V, W, Y**.

### AI-Powered Recognition
- **MediaPipe Hands**: Utilizes Google's robust MediaPipe Hands model for accurate and efficient hand detection and 3D landmark estimation. This model is optimized for real-time performance on various devices.
- **TensorFlow.js**: The application is built on TensorFlow.js, enabling the execution of machine learning models directly within the browser environment, ensuring user privacy as no video data leaves the device.
- **Fingerpose**: Integrates the Fingerpose library to interpret the detected hand landmarks and classify them into corresponding ASL alphabet gestures. This library provides a flexible framework for defining and recognizing custom gestures.

### Enhanced User Interface
- **Live Camera Feed**: Displays the user's live camera feed, allowing them to position their hands correctly for optimal recognition.
- **Recognized Text Display**: Shows the translated text as letters are recognized, building words and sentences in real-time.
- **Confidence Scoring**: Provides a confidence score for each recognized letter, indicating the model's certainty. Only predictions above a certain confidence threshold (currently 70%) are displayed.
- **Recognition Statistics**: Offers insights into the recognition process, including the total number of recognitions, average confidence, and unique letters identified.
- **Recent Letters History**: Displays a history of the last few recognized letters with their confidence scores, aiding in tracking and debugging.

### User-Friendly Controls
- **Start/Stop Camera**: Buttons to easily initiate and terminate the camera feed.
- **Start/Stop Recognition**: Controls to begin and pause the sign language recognition process.
- **Text Editing**: Includes functionality to add spaces between words, backspace to correct errors, and clear the entire recognized text.
- **Copy to Clipboard**: A convenient button to copy the accumulated recognized text to the clipboard for easy sharing or further use.

### Performance and Privacy
- **On-Device Processing**: All AI model inference and video processing occur directly in the user's browser, ensuring that sensitive video data never leaves the local machine. This enhances privacy and reduces latency.
- **Optimized Performance**: The application is designed for efficient performance, with recognition occurring approximately every 800 milliseconds, providing a smooth real-time experience. It includes optimizations such as model caching and recognition cooldowns.

## Technical Stack

- **Frontend**: React 19 with Vite
- **Machine Learning**: TensorFlow.js, MediaPipe Hands, Fingerpose
- **Styling**: Tailwind CSS, Shadcn/ui
- **Package Manager**: pnpm

## Getting Started

To run this application locally, follow these steps:

### Prerequisites
Ensure you have the following software installed on your system:

-   **Node.js**: Version 18 or higher. Download from [nodejs.org](https://nodejs.org/).
-   **pnpm**: Install globally via npm if you don't have it: `npm install -g pnpm`

### Local Setup and Execution

1.  **Download the Project**: Obtain the project source code. If you received a `sign-language-translator.zip` file, extract its contents.

2.  **Navigate to Project Directory**: Open your terminal or command prompt and change your directory to the extracted project folder:
    ```bash
    cd sign-language-translator
    ```

3.  **Install Dependencies**: Install the required project dependencies. This process might take a few minutes depending on your internet speed:
    ```bash
    pnpm install
    ```

4.  **Start the Development Server**: Launch the application in development mode. The `--host` flag makes it accessible from your local network:
    ```bash
    pnpm run dev -- --host
    ```
    You should see a local URL (e.g., `http://localhost:5173/`) in the terminal output. 

5.  **Access the Application**: Open your web browser and navigate to the local URL provided by the development server.

## How to Use the Application

1.  **Enable Webcam**: On the application page, click the "Start Camera" button. Your browser will likely prompt you for permission to access your webcam. Grant this permission to proceed.

2.  **Model Initialization**: The AI models will begin loading. This step can take a few seconds, depending on your internet connection and system specifications. A loading indicator or message will typically be displayed.

3.  **Position Your Hand**: Once the models are loaded, ensure your hand is clearly visible within the camera feed. Good lighting and a contrasting background will improve recognition accuracy.

4.  **Start Recognition**: Click the "Start Recognition" button to activate the real-time sign language detection.

5.  **Perform Gestures**: Form the supported ASL alphabet letters with your hand. For optimal recognition, hold each gesture steady for approximately 1 to 2 seconds.

6.  **View Results**: The recognized letters will appear in the designated text area in real-time.

7.  **Utilize Editing Tools**: 
    - Click "Add Space" to insert a space character into the recognized text.
    - Click "Backspace" to remove the last character from the recognized text.
    - Click "Copy Text" to copy the entire content of the recognized text area to your clipboard.

## Troubleshooting

### "Failed to initialize AI models" Error
This error typically indicates an issue with loading the machine learning models. While the application includes a retry mechanism, persistent issues can occur due to:

-   **Internet Connectivity**: Ensure you have a stable and active internet connection. The models are loaded from a Content Delivery Network (CDN).
-   **CDN Availability**: Rarely, the CDN hosting the models might experience temporary outages. Try refreshing the page or restarting the development server.
-   **Sandbox Environment Limitations**: If you are running the application in a sandboxed environment (like the one I operate in), direct camera access might be restricted due to security policies. In such cases, running the application locally as described above is the recommended solution.

If the error persists, check your browser's developer console (usually by pressing `F12` and navigating to the "Console" tab) for more specific error messages and network request failures.

### Camera Access Issues
If your camera does not activate or you receive a "Failed to access camera" message:

-   **Browser Permissions**: Verify that your web browser has permission to access your camera for the `localhost` domain (or the domain where you are hosting the application). You can usually find these settings in your browser's privacy or site settings.
-   **Other Applications**: Ensure no other applications are currently using your webcam, as this can prevent the browser from accessing it.
-   **Driver Issues**: Confirm that your webcam drivers are up-to-date and functioning correctly on your operating system.

### Performance Concerns
If the recognition is slow or the application feels unresponsive:

-   **System Resources**: Real-time machine learning can be resource-intensive. Ensure your computer meets the minimum system requirements and has sufficient CPU/GPU resources available.
-   **Browser Version**: Use an up-to-date web browser (e.g., Chrome, Firefox, Edge) that supports WebGL for optimized TensorFlow.js performance.
-   **Lighting and Background**: Improve lighting conditions and use a plain, contrasting background to help the hand detection model work more efficiently.

## Contributing

Contributions to this project are welcome! If you find any bugs, have suggestions for new features, or want to improve the existing codebase, please feel free to open an issue or submit a pull request on the GitHub repository.

## License

This project is open-source and available under the [MIT License](LICENSE).

