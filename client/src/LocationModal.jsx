import React, { useState } from 'react';

export default function LocationModal({ setLocation }) {
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    setLocation(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Enter Location</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a location..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-3 rounded mt-4 w-full hover:bg-blue-600 transition-colors duration-200"
        >
          Save
        </button>
        <button
          onClick={() => setLocation('Anywhere')}
          className="bg-red-500 text-white px-6 py-3 rounded mt-2 w-full hover:bg-red-600 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
