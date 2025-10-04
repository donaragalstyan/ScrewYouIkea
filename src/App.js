import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const STAGE_DURATION = 2; // seconds - changeable variable
  const loadingStages = [
    'Extracting text and images...',
    'Generating diagrams...',
    'Reviewing accuracy...'
  ];

  useEffect(() => {
    if (!isLoading) return;

    const startTime = Date.now();
    const stageDurationMs = STAGE_DURATION * 1000;
    const progressPerStage = 100 / loadingStages.length;
    const baseProgress = currentStage * progressPerStage;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const stageProgress = Math.min(elapsed / stageDurationMs, 1);
      
      // Exponential progress: y = (e^(x*3) - 1) / (e^3 - 1) for this stage only
      const exponentialProgress = ((Math.exp(stageProgress * 3) - 1) / (Math.exp(3) - 1));
      const currentProgress = baseProgress + (exponentialProgress * progressPerStage);
      setProgress(currentProgress);

      if (stageProgress >= 1) {
        clearInterval(progressInterval);
        
        // Move to next stage after completing current one
        setTimeout(() => {
          if (currentStage < loadingStages.length - 1) {
            setCurrentStage(prev => prev + 1);
          } else {
            // All stages complete
            setIsLoading(false);
            setCurrentStage(0);
            setProgress(0);
          }
        }, 200);
      }
    }, 16); // ~60fps

    return () => clearInterval(progressInterval);
  }, [isLoading, currentStage]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      console.log('Selected PDF:', file.name);
      setIsLoading(true);
      setCurrentStage(0);
      setProgress(0);
    } else if (file) {
      alert('Please select a PDF file');
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-item">
            <img 
              src="https://via.placeholder.com/40" 
              alt="Logo" 
              className="logo"
            />
          </div>
          <div className="navbar-item">Founders</div>
          <div className="navbar-item">Our mission</div>
        </div>
      </nav>
      <div className="container">
        {!isLoading ? (
          <>
            <h1 className="title">Choose your manual</h1>
            <div className="outer-rectangle">
              <div className="inner-rectangle">
                <p>Use our samples</p>
              </div>
              <div className="inner-rectangle" onClick={handleUploadClick}>
                <p>Upload your own</p>
              </div>
            </div>
          </>
        ) : (
          <div className="loading-container">
            <h2 className="loading-text">{loadingStages[currentStage]}</h2>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

export default App;
