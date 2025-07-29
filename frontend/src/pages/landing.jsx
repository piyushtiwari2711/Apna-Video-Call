import React from 'react'
export default function Landing() {
  return (
     <div className="landing-container">
      <header className="header">
        <div className="logo">Apna Video Call</div>
        <div className="nav-links">
          <a href="#">Join as Guest</a>
          <a href="#">Register</a>
          <a href="#">Login</a>
        </div>
      </header>

      <main className="main-content">
        <div className="text-section">
          <h1>
            <span className="highlight">Connect</span> with your loved Ones
          </h1>
          <p>Cover a distance by Apna Video Call</p>
          <button className="get-started">Get Started</button>
        </div>

        <div className="image-section">
          <img src="/mobile.png"  alt="Video Call Preview" />
        </div>
      </main>
    </div>
  );
};