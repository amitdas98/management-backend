import React, { useState } from 'react';

import jsonData from './output.json';

const CardList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(jsonData);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = jsonData.filter(item =>
      (item.Name && item.Name.toLowerCase().includes(query)) ||
      (item.Reference && item.Reference.toLowerCase().includes(query)) ||
      (item.Location && item.Location.toLowerCase().includes(query))
    );
    setFilteredData(filtered);
  };

  return (
    <div>
      {/* Search Input */}
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Search by Name, Reference, or Location"
          value={searchQuery}
          onChange={handleSearch}
          style={{
            width: '60%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly', // Ensures cards spread evenly across the page
          alignItems: 'flex-start',
          padding: '20px',
          gap: '20px', // Spacing between cards
          margin: 0, // No extra margin
        }}
      >
        {filteredData.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              width: '250px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              background: '#fff'
            }}
          >
            <h3><strong>Name:</strong> {item.name || 'No Name'}</h3>
            <p><strong>SL:</strong> {item.serialNo || 'N/A'}</p>
            <p><strong>Reference:</strong> {item.reference || 'N/A'}</p>
            <p><strong>Location:</strong> {item.location || 'N/A'}</p>
            <p><strong>Holud:</strong> {item.holud || 'N/A'}</p>
            <p><strong>Wedding:</strong> {item.wedding || 'N/A'}</p>
            <p><strong>Reception:</strong> {item.reception || 'N/A'}</p>
            <p><strong>Telephone:</strong> {item.telephone || 'N/A'}</p>
            <div style={{ marginTop: '10px' }}>
              <button
                style={{
                  background: '#007BFF',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '5px'
                }}
                onClick={() => alert(`Editing ${item.Name}`)}
              >
                Edit
              </button>
              <button
                style={{
                  background: '#DC3545',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => alert(`Deleting ${item.Name}`)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <p style={{ textAlign: 'center', width: '100%', marginTop: '20px', fontSize: '18px' }}>
            No results found
          </p>
        )}
      </div>
    </div>
  );
};

export default CardList;