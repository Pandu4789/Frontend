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

  const itemColumns = useMemo(() => {
    if (!items || items.length === 0) return [];
    const totalItems = items.length;
    const itemsPerColumn = totalItems > 45 ? 20 : 15;
    const numColumns = Math.ceil(totalItems / itemsPerColumn);
    const columns = [];
    for (let i = 0; i < numColumns; i++) {
        const start = i * itemsPerColumn;
        const end = start + itemsPerColumn;
        columns.push(items.slice(start, end));
    }
    return columns;
  }, [items]);

  const handlePrintItems = () => {
    if (!selectedPooja) {
      setToastMessage({ type: 'warning', message: 'Please select a Pooja to print!' });
      return;
    }
    
    const totalItems = items.length;
    const itemsPerColumn = totalItems > 45 ? 20 : 15;
    const numColumns = Math.ceil(totalItems / itemsPerColumn);
    const printColumns = [];
    for (let i = 0; i < numColumns; i++) {
        const start = i * itemsPerColumn;
        const end = start + itemsPerColumn;
        printColumns.push(items.slice(start, end));
    }

    const itemsHtml = printColumns.map(column => `
        <ul class="items-column-print">
            ${column.map(item => `<li>${item.itemName} - ${item.quantity} ${item.unit || ''}</li>`).join('')}
        </ul>
    `).join('');

    const printContent = `
      <html>
        <head>
          <title>${selectedPooja.name} Pooja Items List</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #333; max-width: 800px; margin: 0 auto; }
            .pooja-header { background-color: #f7ede0; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e0c8b2; }
            h1 { color: #B74F2F; text-align: center; margin-bottom: 10px; }
            p { margin-bottom: 10px; font-size: 0.95rem; color: #555; }
            .category, .duration, .price { font-weight: bold; color: #8C472A; }
            li { margin-bottom: 8px; font-size: 1rem; }
            .section-title-print { display: flex; align-items: center; gap: 10px; color: #8C472A; font-size: 1.2rem; margin-bottom: 15px; }
            .items-container-print { display: flex; gap: 20px; align-items: flex-start; }
            .items-column-print { flex: 1; list-style-type: disc; padding-left: 20px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="pooja-header">
            <h1>${selectedPooja.name || 'Pooja'}</h1>
            <p>${selectedPooja.description || ''}</p>
            <p><span class="category">Category:</span> ${selectedPooja.category || 'Wealth & Prosperity'}</p>
            <p><span class="duration">Duration:</span> ${selectedPooja.duration || '1.5 - 2 hours'}</p>
            <p><span class="price">Estimated Price:</span> ${selectedPooja.estimatedPrice || '$150 - $300'}</p>
          </div>
          <div class="section-title-print">
              <h3>Items Required</h3>
          </div>
          <div class="items-container-print">
            ${itemsHtml.length > 0 ? itemsHtml : '<ul><li>No items listed.</li></ul>'}
          </div>
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
      <div className="event-select-dropdown">
        <label htmlFor="poojaSelect" className="select-label">Select Pooja:</label>
        <select id="poojaSelect" value={selectedPoojaId} onChange={(e) => setSelectedPoojaId(e.target.value)} className="pooja-select">
          <option value="">-- Select Pooja --</option>
          {poojas.map(pooja => ( <option key={pooja.id} value={pooja.id}>{pooja.name}</option> ))}
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
                <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/></svg>
              </span>
              <h3 className="section-title">Items Required</h3>
            </div>
            
            <div className="items-list-columns-container">
              {items.length > 0 ? (
                itemColumns.map((column, colIndex) => (
                  <ul className="items-column" key={colIndex}>
                    {column.map(item => (
                      <li key={item.id}>
                        <span className="item-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" height="10" width="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
                        </span>
                        {`${item.itemName} - ${item.quantity} ${item.unit || ''}`}
                      </li>
                    ))}
                  </ul>
                ))
              ) : (
                <p className="no-items-message">No items listed for this Pooja.</p>
              )}
            </div>
          </div>

          <div className="pooja-footer-details">
            <div className="detail-item">
              <span className="detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
              </span>
              <span className="detail-label">Duration</span>
              <span className="detail-value">{selectedPooja.duration || '1.5 - 2 hours'}</span>
            </div>
            
            {/* ✅ CHANGED: Restored the previous "money" icon and placeholder text. */}
            <div className="detail-item">
              <span className="detail-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 6v12h20V6H2zm2 2h2a2 2 0 0 1 4 0h4a2 2 0 0 1 4 0h2v8h-2a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H4V8zm8 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                </svg>
              </span>
              <span className="detail-label">Estimated Price</span>
              <span className="detail-value">{selectedPooja.estimatedPrice || '$150 - $300'}</span>
            </div>
          </div>
          <button onClick={handlePrintItems} className="print-list-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zm-3 10H8v-4h8v4zm3-6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM18 3H6v4h12V3z" /></svg>
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

