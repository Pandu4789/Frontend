import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPhoneAlt } from 'react-icons/fa';

const PriestList = () => {
  const [priests, setPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [filters, setFilters] = useState({ name: '', phone: '', poojaType: '' });

  const loadPriests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/priests');
      let data = response.data;

      if (filters.name) {
        data = data.filter(p => p.firstName.toLowerCase().includes(filters.name.toLowerCase()));
      }
      if (filters.phone) {
        data = data.filter(p => p.phone && p.phone.includes(filters.phone));
      }
      if (filters.poojaType) {
        data = data.filter(p => 
          p.poojas && p.poojas.some(pooja => pooja.name === filters.poojaType)
        );
      }

      setPriests(data);
    } catch (err) {
      console.error('Failed to fetch priests:', err);
    }
  };

  const loadAvailablePoojas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/events'); // Adjust the endpoint if needed
      setAvailablePoojas(response.data);
    } catch (err) {
      console.error('Failed to fetch pooja types:', err);
    }
  };

  useEffect(() => {
    loadAvailablePoojas();
  }, []);

  useEffect(() => {
    loadPriests();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', phone: '', poojaType: '' });
  };

  return (
    <div className="priest-directory">
      <h1>Divine Connect - Priest Directory</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by name"
          value={filters.name}
          onChange={e => handleFilterChange('name', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by phone"
          value={filters.phone}
          onChange={e => handleFilterChange('phone', e.target.value)}
        />
        
        {/* 🔽 Dropdown for Pooja Type */}
        <select
          value={filters.poojaType}
          onChange={e => handleFilterChange('poojaType', e.target.value)}
        >
          <option value="">Filter by pooja type</option>
          {availablePoojas.map(pooja => (
            <option key={pooja.id} value={pooja.name}>{pooja.name}</option>
          ))}
        </select>

        <button onClick={resetFilters} className="reset-btn">
          Reset Filters
        </button>
      </div>

      <div className="priest-list">
        {priests.map(priest => (
          <div key={priest.id} className="priest-card">
            <h2>{priest.firstName} {priest.lastName}</h2>
            <p className="phone">
              <FaPhoneAlt className="phone-icon" /> {priest.phone || 'N/A'}
            </p>
            <div className="pooja-tags">
              {priest.poojas?.map((pooja, index) => (
                <span key={index} className="pooja-badge">{pooja.name}</span>
              ))}
            </div>
            <p className="bio">{priest.description || 'No bio available.'}</p>
            <button 
              className="view-profile"
              onClick={() => window.location.href = `/priests/${priest.id}`}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
   


      <style jsx>{`
        .priest-directory {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        h1 {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 600;
        }
        
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        
        .filters input {
          flex: 1;
          min-width: 200px;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .filters input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
        }
        
        .reset-btn {
          padding: 10px 20px;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .reset-btn:hover {
          background: #e0e0e0;
        }
        
        .priest-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .priest-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .priest-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.12);
        }
        
        .priest-card h2 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
        }
        
        .phone {
          color: #7f8c8d;
          margin: 0 0 15px 0;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .phone-icon {
          color: #3498db;
        }

        .pooja-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .pooja-badge {
          background: #3498db;
          color: white;
          padding: 5px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .bio {
          color: #666;
          margin: 15px 0;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .view-profile {
          display: inline-block;
          margin-top: 10px;
          padding: 8px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .view-profile:hover {
          background: #2980b9;
        }
        
        @media (max-width: 768px) {
          .filters {
            flex-direction: column;
          }
          
          .filters input {
            width: 100%;
          }
          
          .priest-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PriestList;
