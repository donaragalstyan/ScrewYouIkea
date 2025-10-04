# ScrewYouIkea

A React.js front-end application for manual processing with PDF upload functionality.

## Features

- **Manual Selection**: Choose between sample manuals or upload your own PDF
- **PDF Upload**: Click "Upload your own" to select and upload PDF files
- **Loading Progress**: Visual feedback with exponential progress bar showing extraction, diagram generation, and accuracy review stages
- **Responsive Design**: Modern, clean UI with hover effects and smooth transitions

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd ScrewYouIkea
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the development server:

```bash
npm start
```

The application will automatically open in your default browser at [http://localhost:3000](http://localhost:3000).

If it doesn't open automatically, manually navigate to `http://localhost:3000` in your browser.

## Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm run build`** - Builds the app for production to the `build` folder
- **`npm test`** - Launches the test runner
- **`npm run eject`** - Ejects from Create React App (one-way operation)

## Usage

1. Launch the application using `npm start`
2. Choose one of two options:
   - **Use our samples** - Access pre-loaded sample manuals
   - **Upload your own** - Click to open file explorer and select a PDF file
3. After uploading a PDF, watch the progress bar as it processes through three stages:
   - Extracting text and images...
   - Generating diagrams...
   - Reviewing accuracy...

## Project Structure

```
ScrewYouIkea/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main React component
│   ├── App.css         # Application styles
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## Customization

### Adjusting Loading Stage Duration

In `src/App.js`, modify the `STAGE_DURATION` variable to change how long each loading stage takes:

```javascript
const STAGE_DURATION = 2; // seconds - change this value
```

## Technologies Used

- React 18.2.0
- React Scripts 5.0.1
- CSS3 for styling