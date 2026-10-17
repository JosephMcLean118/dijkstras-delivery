import React, { useState } from 'react';

function About() {
  // S
  const [isOpen, setIsOpen] = useState(false);

  const contentBlocks = [
    {
      text: "This website has been designed in order to teach beginners one of the most popular search algorithms in computing science, the Dijkstra's Algorithm.",
    },
    {
      text: "Dijkstra's Algorithm was developed by Edsger Dijkstra and published in 1959.",
    },
    {
      text: "The algorithm, like many other search algorithms intends to find the shortest path from 1 node to another. In essence, its process is picking the closest unvisited vertex and then visiting each unvisited neighbor node and and calculating the distance through them, updating their distance if the distance between them is smaller than the nodes current distance."
    },
    {
      text: "This game has been designed to teach the fundamentals of the Dijkstra's algorithm through fun, challenging repetition with the goal of completing a given pizza route in as little time and fuel as possible.",
    },
  ];

  return (
    <div className="about-dropdown-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

        .about-dropdown-container {
          font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          background-color: white;
          margin: 20px;
          /* CHANGED: Rounded corners removed */
          border-radius: 0; 
          overflow: hidden;
          border: 1px solid #dee2e6;
        }

        
    
        .about-page-wrapper .header-bar {
          display: flex;
          align-items: center;
          /* CHANGED: Pure white background */
          background-color: #ffffff; 
          border-bottom: 1px solid #dee2e6;
          padding: 1rem 2rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          user-select: none;
        }

        .about-page-wrapper .header-bar:hover {
          background-color: #fcfcfc;
        }

        .about-page-wrapper .info-icon {
          font-size: 24px;
          color: #6c757d;
          margin-right: 12px;
        }

        .about-page-wrapper .header-title {
          /* CHANGED: h4 size (approx 1.25rem - 1.5rem) */
          font-size: 1.35rem; 
          font-weight: 700;
          margin: 0;
        }

        
    
        .about-collapse-content {
          display: ${isOpen ? 'block' : 'none'};
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        
        .about-page-wrapper .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .about-page-wrapper .content-column {
          border-left: 4px solid #007bff; 
          padding-left: 2.5rem;         
          margin-left: 1rem;            
        }
        
        .about-page-wrapper .content-block {
          margin-bottom: 2.5rem;
        }

        .about-page-wrapper .content-block:last-child {
          margin-bottom: 0;
        }
        
        .about-page-wrapper .description-text {
          font-size: 1rem;
          line-height: 1.5;
          color: #1a1a1a;
          margin: 0;
        }
      `}</style>

      <div className="about-page-wrapper">
        <div 
          className="header-bar" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="info-icon">ⓘ</span>
          <h1 className="header-title">About</h1>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#6c757d' }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        <div className="about-collapse-content">
          <div className="about-container">
            <div className="content-column">
              {contentBlocks.map((block, index) => (
                <div key={index} className="content-block">
                  <p className="description-text">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;