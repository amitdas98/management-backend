import React, { useState, useEffect } from 'react';

const API_GET_URL = 'https://management-backend-qdno.onrender.com/getAllGuests';
const API_UPDATE_URL = 'https://management-backend-qdno.onrender.com/update/card';

const CardList = () => {
  const [data, setData] = useState([]); // Store data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({}); // Track editable states
  const [searchQuery, setSearchQuery] = useState(''); // For text search
  const [filters, setFilters] = useState({
    invitedHolud: 'all', // "all", "yes", "no"
    invitedWedding: 'all', // "all", "yes", "no"
    invitedReception: 'all', // "all", "yes", "no"
  });

  // Fetch data from the API
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }

      const guests = await response.json();
      setData(guests); // Set the fetched data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // Handle field edit
  const handleFieldChange = (id, field, value) => {
    setData((prevData) =>
      prevData.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      )
    );
    setEditing((prevEditing) => ({ ...prevEditing, [id]: true }));
  };

  // Save the updated card and fetch updated data
  const handleSave = async (id) => {
    const updatedCard = data.find((item) => item._id === id);

    try {
      const response = await fetch(API_UPDATE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      // Reset editing state for the card
      setEditing((prevEditing) => ({ ...prevEditing, [id]: false }));

      // Fetch the updated list
      fetchGuests();
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  // Apply filters and search
  const filteredData = data.filter((item) => {
    // Search filter
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery)) ||
      (item.reference && item.reference.toLowerCase().includes(searchQuery)) ||
      (item.serialNo && item.serialNo.toString().includes(searchQuery)) ||
      (item.location && item.location.toLowerCase().includes(searchQuery));

    // InvitedHolud filter
    const matchesHolud =
      filters.invitedHolud === 'all' ||
      (filters.invitedHolud === 'yes' && item.invitedHolud) ||
      (filters.invitedHolud === 'no' && !item.invitedHolud);

    // InvitedWedding filter
    const matchesWedding =
      filters.invitedWedding === 'all' ||
      (filters.invitedWedding === 'yes' && item.invitedWedding) ||
      (filters.invitedWedding === 'no' && !item.invitedWedding);

    // InvitedReception filter
    const matchesReception =
      filters.invitedReception === 'all' ||
      (filters.invitedReception === 'yes' && item.invitedReception) ||
      (filters.invitedReception === 'no' && !item.invitedReception);

    return matchesSearch && matchesHolud && matchesWedding && matchesReception;
  });

  // Loading and error handling
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {/* Search Bar */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name, reference, serialNo, location"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: '60%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div>
          <strong>Invited Holud:</strong>
          <select
            value={filters.invitedHolud}
            onChange={(e) => handleFilterChange('invitedHolud', e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <strong>Invited Wedding:</strong>
          <select
            value={filters.invitedWedding}
            onChange={(e) => handleFilterChange('invitedWedding', e.target.value)}
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <strong>Invited Reception:</strong>
          <select
            value={filters.invitedReception}
            onChange={(e) =>
              handleFilterChange('invitedReception', e.target.value)
            }
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
          padding: '20px',
          gap: '20px',
          margin: 0,
        }}
      >
        {filteredData.map((item) => (
          <div
            key={item._id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              width: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              background: '#fff',
              textAlign: 'center',
            }}
          >
            <EditableField
              label="Name"
              value={item.name}
              onChange={(value) => handleFieldChange(item._id, 'name', value)}
            />
            <EditableField
              label="Reference"
              value={item.reference}
              onChange={(value) => handleFieldChange(item._id, 'reference', value)}
            />
            <EditableField
              label="Serial No"
              value={item.serialNo}
              onChange={(value) => handleFieldChange(item._id, 'serialNo', value)}
            />
            <EditableField
              label="Location"
              value={item.location}
              onChange={(value) => handleFieldChange(item._id, 'location', value)}
            />
            <ToggleField
              label="Invited Holud"
              value={item.invitedHolud}
              onChange={(value) =>
                handleFieldChange(item._id, 'invitedHolud', value)
              }
            />
            <ToggleField
              label="Invited Wedding"
              value={item.invitedWedding}
              onChange={(value) =>
                handleFieldChange(item._id, 'invitedWedding', value)
              }
            />
            <ToggleField
              label="Invited Reception"
              value={item.invitedReception}
              onChange={(value) =>
                handleFieldChange(item._id, 'invitedReception', value)
              }
            />
            <button
              onClick={() => handleSave(item._id)}
              disabled={!editing[item._id]} // Enable only if there's an edit
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: editing[item._id] ? '#007BFF' : '#ccc',
                color: '#fff',
                cursor: editing[item._id] ? 'pointer' : 'not-allowed',
              }}
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditableField = ({ label, value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ marginBottom: '10px' }}>
      <strong>{label}:</strong>{' '}
      {isEditing ? (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          style={{
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      ) : (
        <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
          {value || 'N/A'}
        </span>
      )}
    </div>
  );
};

const ToggleField = ({ label, value, onChange }) => (
  <div style={{ marginBottom: '10px' }}>
    <strong>{label}:</strong>{' '}
    <button
      onClick={() => onChange(!value)}
      style={{
        padding: '5px 10px',
        borderRadius: '5px',
        backgroundColor: value ? '#28a745' : '#dc3545',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {value ? 'Yes' : 'No'}
    </button>
  </div>
);

export default CardList;