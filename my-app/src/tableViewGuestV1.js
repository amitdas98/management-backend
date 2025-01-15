"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Typography,
  Button,
  CardFooter,
  IconButton,
  Tooltip,
  Checkbox,
  Spinner,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, PencilIcon } from "@heroicons/react/24/outline";

const API_GET_URL = "https://management-backend-qdno.onrender.com/getAllGuests";
const API_UPDATE_URL = "https://management-backend-qdno.onrender.com/update/card";

const TABLE_HEAD = ["Name", "Reference", "Location", "Actions"];
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function MembersTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    invitedHolud: false,
    invitedWedding: false,
    invitedReception: false,
    invited: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);

  const filterMenuRef = useRef(null);

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
      setData(guests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setFilterMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle field edit in card
  const handleFieldChange = (field, value) => {
    setEditingItem((prevItem) => ({
      ...prevItem,
      [field]: value,
    }));
  };

  // Save the updated card
  const handleSave = async () => {
    try {
      const response = await fetch(API_UPDATE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      fetchGuests(); // Refresh the data
      setEditingItem(null); // Close the card view
    } catch (err) {
      alert("Error saving data: " + err.message);
    }
  };

  // Handle filter checkbox change
  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      invitedHolud: false,
      invitedWedding: false,
      invitedReception: false,
      invited: false,
    });
  };

  // Apply filters and search
  const filteredData = data.filter((item) => {
    const matchesFilters = Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return item[key];
    });

    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery) ||
      item.reference?.toLowerCase().includes(searchQuery) ||
      item.location?.toLowerCase().includes(searchQuery);

    return matchesFilters && matchesSearch;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading)
    return (
        <div className="flex items-center justify-center h-screen">
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="h-screen p-4 bg-gray-50">
      <Card className="h-full w-full max-w-6xl mx-auto p-4 overflow-hidden flex flex-col">
        {/* Search and Filters Section */}
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">
              Guest list for Wedding
            </Typography>
            <Button
              size="sm"
              variant="outlined"
              onClick={() => setFilterMenuVisible((prev) => !prev)}
            >
              Filters
            </Button>
          </div>
          {filterMenuVisible && (
            <div
              ref={filterMenuRef}
              className="absolute z-50 right-4 top-20 bg-white p-4 rounded-lg shadow-lg"
            >
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Filters
              </Typography>
              {Object.keys(filters).map((filterName) => (
                <label key={filterName} className="flex items-center mb-2">
                  <Checkbox
                    checked={filters[filterName]}
                    onChange={() => handleFilterChange(filterName)}
                    className="mr-2"
                  />
                  <span>{filterName.replace(/([A-Z])/g, " $1")}</span>
                </label>
              ))}
              <Button size="sm" variant="outlined" onClick={resetFilters} className="mt-2">
                Reset Filters
              </Button>
            </div>
          )}
          <Input
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            icon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="w-full md:w-1/2"
          />
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto">
          <table className="w-full table-auto text-left border">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-gray-200 bg-gray-100 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map(({ _id, name, reference, location, ...rest }, index) => {
                const isLast = index === currentItems.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-gray-200";

                return (
                  <tr key={_id}>
                    <td className={classes}>{name}</td>
                    <td className={classes}>{reference}</td>
                    <td className={classes}>{location}</td>
                    <td className={classes}>
                      <Tooltip content="Edit Member">
                        <IconButton
                          variant="text"
                          onClick={() =>
                            setEditingItem({ _id, name, reference, location, ...rest })
                          }
                        >
                          <PencilIcon className="h-5 w-5 text-blue-gray" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <CardFooter className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Page {currentPage} of {totalPages}
            </Typography>
            <select
              className="p-1 border rounded-md"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Editing Section */}
      {editingItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <Typography variant="h5" className="mb-4">
              Edit Member
            </Typography>
            <div className="flex flex-col gap-4">
              <Input
                label="Name"
                value={editingItem.name || ""}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
              <Input
                label="Reference"
                value={editingItem.reference || ""}
                onChange={(e) => handleFieldChange("reference", e.target.value)}
              />
              <Input
                label="Location"
                value={editingItem.location || ""}
                onChange={(e) => handleFieldChange("location", e.target.value)}
              />
              <Input
                label="Holud"
                value={editingItem.holud || 0}
                onChange={(e) => handleFieldChange("holud", e.target.value)}
              />
              <Input
                label="Wedding"
                value={editingItem.wedding || 0}
                onChange={(e) => handleFieldChange("wedding", e.target.value)}
              />
              <Input
                label="Name"
                value={editingItem.reception || 0}
                onChange={(e) => handleFieldChange("reception", e.target.value)}
              />
              <Checkbox
                label="Invited Holud"
                checked={!!editingItem.invitedHolud}
                onChange={(e) => handleFieldChange("invitedHolud", e.target.checked)}
              />
              <Checkbox
                label="Invited Wedding"
                checked={!!editingItem.invitedWedding}
                onChange={(e) => handleFieldChange("invitedWedding", e.target.checked)}
              />
              <Checkbox
                label="Invited Reception"
                checked={!!editingItem.invitedReception}
                onChange={(e) => handleFieldChange("invitedReception", e.target.checked)}
              />
              <Checkbox
                label="Invited"
                checked={!!editingItem.invited}
                onChange={(e) => handleFieldChange("invited", e.target.checked)}
              />
            </div>
            <div className="flex justify-between mt-6">
              <Button
                size="sm"
                variant="outlined"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}