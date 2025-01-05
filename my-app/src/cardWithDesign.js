"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Button } from "flowbite-react";

const API_GET_URL = "https://management-backend-qdno.onrender.com/getAllGuests";
const API_UPDATE_URL = "https://management-backend-qdno.onrender.com/update/card";

const CardList = () => {
  const [data, setData] = useState([]); // Store data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({}); // Track editable states
  const [searchQuery, setSearchQuery] = useState(""); // For text search
  const [filtersVisible, setFiltersVisible] = useState(false); // Toggle filters visibility
  const [filters, setFilters] = useState({
    invitedHolud: false,
    invitedWedding: false,
    invitedReception: false,
    invited: false,
  });

  const filterBoxRef = useRef(null);

  // Fetch data from the API
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch guests");
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      // Reset editing state for the card
      setEditing((prevEditing) => ({ ...prevEditing, [id]: false }));

      // Fetch the updated list
      fetchGuests();
    } catch (err) {
      alert("Error saving data: " + err.message);
    }
  };

  // Handle filter toggle
  const handleFilterToggle = () => {
    setFiltersVisible(!filtersVisible);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Handle filter checkbox change
  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  // Apply filters and search
  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchQuery)) ||
      (item.reference && item.reference.toLowerCase().includes(searchQuery)) ||
      (item.serialNo && item.serialNo.toString().includes(searchQuery)) ||
      (item.location && item.location.toLowerCase().includes(searchQuery));

    const matchesFilters = Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return item[key];
    });

    return matchesSearch && matchesFilters;
  });

  // Loading and error handling
  if (loading) return <p className="text-center text-lg font-semibold">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      {/* Search and Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by name, reference, serialNo, location"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-2/3 p-2 rounded-lg border border-gray-300 shadow-sm"
        />
        <div className="relative">
          <Button onClick={handleFilterToggle} className="ml-4 bg-blue-600 text-white">
            Filter
          </Button>
          {filtersVisible && (
            <div
              ref={filterBoxRef}
              className="absolute right-0 top-12 bg-white p-4 rounded-lg shadow-lg z-10"
            >
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.invitedHolud}
                  onChange={() => handleFilterChange("invitedHolud")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-800">Invited Holud</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.invitedWedding}
                  onChange={() => handleFilterChange("invitedWedding")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-800">Invited Wedding</span>
              </label>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={filters.invitedReception}
                  onChange={() => handleFilterChange("invitedReception")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-800">Invited Reception</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.invited}
                  onChange={() => handleFilterChange("invited")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-800">Invited</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <Card key={item._id} className="shadow-md rounded-md p-4 bg-white">
            <div className="flex flex-col space-y-3">
              <EditableField
                label="Name"
                value={item.name}
                onChange={(value) => handleFieldChange(item._id, "name", value)}
              />
              <EditableField
                label="Reference"
                value={item.reference}
                onChange={(value) =>
                  handleFieldChange(item._id, "reference", value)
                }
              />
              <EditableField
                label="Serial No"
                value={item.serialNo}
                onChange={(value) =>
                  handleFieldChange(item._id, "serialNo", value)
                }
              />
              <EditableField
                label="Location"
                value={item.location}
                onChange={(value) =>
                  handleFieldChange(item._id, "location", value)
                }
              />
              <EditableField
                label="Telephone"
                value={item.telephone}
                onChange={(value) =>
                  handleFieldChange(item._id, "telephone", value)
                }
              />
              <EditableField
                label="Holud"
                value={item.holud}
                onChange={(value) =>
                  handleFieldChange(item._id, "holud", value)
                }
              />
              <EditableField
                label="Wedding"
                value={item.wedding}
                onChange={(value) =>
                  handleFieldChange(item._id, "wedding", value)
                }
              />
              <EditableField
                label="Reception"
                value={item.reception}
                onChange={(value) =>
                  handleFieldChange(item._id, "reception", value)
                }
              />
              <ToggleField
                label="Invited Holud"
                value={item.invitedHolud}
                onChange={(value) =>
                  handleFieldChange(item._id, "invitedHolud", value)
                }
              />
              <ToggleField
                label="Invited Wedding"
                value={item.invitedWedding}
                onChange={(value) =>
                  handleFieldChange(item._id, "invitedWedding", value)
                }
              />
              <ToggleField
                label="Invited Reception"
                value={item.invitedReception}
                onChange={(value) =>
                  handleFieldChange(item._id, "invitedReception", value)
                }
              />
              <ToggleField
                label="Invited"
                value={item.invited}
                onChange={(value) =>
                  handleFieldChange(item._id, "invited", value)
                }
              />
            </div>
            <Button
              onClick={() => handleSave(item._id)}
              disabled={!editing[item._id]} // Button only activates if changes are made
              className={`mt-4 w-full ${
                editing[item._id] ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
              } text-white text-sm`}
            >
              Save Changes
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Component for displaying editable key-value pairs
const EditableField = ({ label, value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <span className="font-medium text-gray-700 text-sm">{label}:</span>
      {isEditing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="text-sm text-gray-800 cursor-pointer"
        >
          {value || "N/A"}
        </span>
      )}
    </div>
  );
};

// Toggle field for boolean values
const ToggleField = ({ label, value, onChange }) => (
  <div className="flex justify-between items-center">
    <span className="font-medium text-gray-700 text-sm">{label}:</span>
    <Button
      onClick={() => onChange(!value)}
      className={`text-xs w-16 text-center ${
        value ? "bg-green-500" : "bg-red-500"
      } text-white`}
    >
      {value ? "Yes" : "No"}
    </Button>
  </div>
);

export default CardList;