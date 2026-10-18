



import { useState } from 'react';

function About() {
  const [isOpen, setIsOpen] = useState(false);

  const contentBlocks = [
    {
      text: "This website has been designed in order to teach beginners one of the most popular search algorithms in computing science, the Dijkstra's Algorithm.",
    },
    {
      text: "Dijkstra's Algorithm was developed by Edsger Dijkstra and published in 1959.",
    },
    {
      text: "The algorithm, like many other search algorithms intends to find the shortest path from 1 node to another. In essence, its process is picking the closest unvisited vertex and then visiting each unvisited neighbor node and calculating the distance through them, updating their distance if the distance between them is smaller than the nodes current distance."
    },
    {
      text: "This game has been designed to teach the fundamentals of the Dijkstra's algorithm through fun, challenging repetition with the goal of completing a given pizza route in as little time and fuel as possible.",
    },
  ];

  return (
    <div className="about-dropdown-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap');

        .about-dropdown-container {
          font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          /* MATCH: Changed from white to Cream to match Nav Bar */
          background-color: #fdf5e6; 
          margin: 20px;
          border-radius: 4px; 
          overflow: hidden;
          border: 2px solid #4a3728; 
        }

        .about-page-wrapper .header-bar {
          display: flex;
          align-items: center;
          background-color: #fdf5e6; 
          border-bottom: 2px solid #4a3728;
          padding: 1rem 2rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          user-select: none;
        }

        .about-page-wrapper .header-bar:hover {
          background-color: #f5e6ca;
        }

        .about-page-wrapper .info-icon {
          font-size: 20px;
          color: #6b4f3b;
          margin-right: 15px;
        }

        .about-page-wrapper .header-title {
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem; 
          font-weight: 700;
          margin: 0;
          color: #5d7a32; 
          text-transform: uppercase;
        }

        .about-collapse-content {
          display: ${isOpen ? 'block' : 'none'};
          animation: fadeIn 0.3s ease-in-out;
          /* MATCH: Changed from white to Cream to match Nav Bar */
          background-color: #fdf5e6; 
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
          border-left: 4px solid #d2b48c; 
          padding-left: 2rem;         
          margin-left: 1rem;            
        }
        
        .about-page-wrapper .content-block {
          margin-bottom: 1.5rem;
        }

        .about-page-wrapper .content-block:last-child {
          margin-bottom: 0;
        }
        
        .about-page-wrapper .description-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #333;
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
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#6b4f3b' }}>
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