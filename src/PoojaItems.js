import React, { useState, useEffect, useMemo } from 'react';
import './PoojaItems.css';

const PoojaItems = () => {
  const [poojas, setPoojas] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then(res => res.json())
      .then(data => setPoojas(data))
      .catch(err => console.error('Error fetching poojas:', err));
  }, []);

  useEffect(() => {
    if (selectedPoojaId) {
      fetch(`http://localhost:8080/api/pooja-items/event/${selectedPoojaId}`)
        .then(res => res.json())
        .then(data => {
          setItems(data);
        })
        .catch(err => console.error('Error fetching pooja items:', err));
    } else {
      setItems([]);
    }
  }, [selectedPoojaId]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const selectedPooja = useMemo(() =>
    poojas.find(p => p.id === parseInt(selectedPoojaId)),
    [poojas, selectedPoojaId]
  );

  const handlePrintItems = () => {
     console.log('Print button clicked');
    if (!selectedPooja) {
      setToastMessage({ type: 'warning', message: 'Please select a Pooja to print!' });
      return;
    }
    const printContent = `
      <html>
        <head>
          <title>${selectedPooja.name} Pooja Items List</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 30px;
              color: #333;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
            }
            .pooja-header {
              background-color: #f7ede0;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 25px;
              border: 1px solid #e0c8b2;
            }
            h1 {
              color: #B74F2F;
              text-align: center;
              margin-bottom: 10px;
            }
            h2 {
              color: #B74F2F;
              margin-top: 25px;
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            p {
              margin-bottom: 10px;
              font-size: 0.95rem;
              color: #555;
            }
            .category, .duration, .price {
              font-weight: bold;
              color: #8C472A;
            }
            ul {
              list-style-type: disc;
              padding-left: 25px;
              margin-top: 10px;
            }
            li {
              margin-bottom: 8px;
              font-size: 1rem;
            }
            .section-title-print {
              display: flex;
              align-items: center;
              gap: 10px;
              color: #8C472A;
              font-size: 1.2rem;
              margin-bottom: 15px;
            }
            .section-title-print svg {
              width: 24px;
              height: 24px;
              fill: #8C472A;
            }
          </style>
        </head>
        <body>
          <div class="pooja-header">
            <h1>${selectedPooja.name || 'Pooja'}</h1>
            <p>${selectedPooja.description || 'Dedicated to Goddess Lakshmi, the bestower of wealth, prosperity, and good fortune. Often performed on Fridays or during Diwali.'}</p>
            <p><span class="category">Category:</span> ${selectedPooja.category || 'Wealth & Prosperity'}</p>
            <p><span class="duration">Duration:</span> ${selectedPooja.duration || '1.5 - 2 hours'}</p>
            <p><span class="price">Estimated Price:</span> ${selectedPooja.estimatedPrice || '$71 - $151'}</p>
          </div>

          <div class="section-title-print">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
              </svg>
              <h3>Items Required</h3>
          </div>
          <ul>
            ${items.length > 0 ? items.map(item => `<li>${item.itemName}${item.quantity ? ` - ${item.quantity}` : ''}</li>`).join('') : '<li>No items listed.</li>'}
          </ul>
        </body>
      </html>`;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      setToastMessage({ type: 'error', message: 'Pop-up blocked! Please allow pop-ups for printing.' });
    }
  };


  return (
    <div className="pooja-items-container">
      <h1 className="pooja-main-title">Pooja Guide</h1>
      {/* <p className="pooja-main-description">Choose a Pooja to explore its complete ritual details: items needed, estimated time, cost, and significance.</p> */}

      <div className="event-select-dropdown">
        <label htmlFor="poojaSelect" className="select-label">Select Pooja:</label>
        <select
          id="poojaSelect"
          value={selectedPoojaId}
          onChange={(e) => setSelectedPoojaId(e.target.value)}
          className="pooja-select"
        >
          <option value="">-- Select Pooja --</option>
          {poojas.map(pooja => (
            <option key={pooja.id} value={pooja.id}>
              {pooja.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPooja && (
        <div className="pooja-details-card">
          <div className="pooja-header-section">
            <div className="pooja-title-description">
              <h2 className="pooja-name">{selectedPooja.name}</h2>
              <p className="pooja-description">{selectedPooja.description}</p>
            </div>
          </div>

          <div className="pooja-category-section">
            <span className="category-label">Category</span>
            <span className="category-value">{selectedPooja.category || 'Wealth & Prosperity'}</span>
          </div>

          <div className="items-required-section">
            <div className="section-header">
              <span className="section-icon">
                {/* Items Required Icon (Checklist/List) - Remains the same good one */}
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
                </svg>
              </span>
              <h3 className="section-title">Items Required</h3>
            </div>
            <ul className="items-list">
              {items.length > 0 ? items.map(item => (
                <li key={item.id}>
                  <span className="item-icon">
                    {/* Basic dot or placeholder for individual item */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="5"/>
                    </svg>
                  </span>
                  {item.itemName}
                </li>
              )) : (
                <li className="no-items-message">No items listed for this Pooja.</li>
              )}
            </ul>
          </div>

          <div className="pooja-footer-details">
            <div className="detail-item">
              <span className="detail-icon">
                {/* Duration Icon - Remains the same */}
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </span>
              <span className="detail-label">Duration</span>
              <span className="detail-value">{selectedPooja.duration || '1.5 - 2 hours'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">
                {/* UPDATED Estimated Price Icon (Dollar Sign) */}
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor">
  <path d="M2 6v12h20V6H2zm2 2h2a2 2 0 0 1 4 0h4a2 2 0 0 1 4 0h2v8h-2a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H4V8zm8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6
z" />
                </svg>


              </span>
              <span className="detail-label">Estimated Price</span>
              <span className="detail-value">{selectedPooja.estimatedPrice || '$71 - $151'}</span>
            </div>
          </div>

          <button onClick={handlePrintItems} className="print-list-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zm-3 10H8v-4h8v4zm3-6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM18 3H6v4h12V3z" />
            </svg>
            <span>Print List</span>
          </button>
        </div>
      )}

      {!selectedPooja && (
        <div className="no-selection-message">
          <p>Please select a Pooja from the dropdown above to view its details and required items.</p>
        </div>
      )}

      {toastMessage && (
        <div className={`pooja-toast ${toastMessage.type}`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};

export default PoojaItems;