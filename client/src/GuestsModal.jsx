import React, { useState } from 'react';

export default function GuestsModal({ setGuests }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  const handleSave = () => {
    const guestCount = adults + children + infants + pets;
    setGuests(`${guestCount} guests`);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl mb-4">Select Guests</h2>
        <div className="space-y-4">
          <GuestCategory label="Adults" count={adults} setCount={setAdults} />
          <GuestCategory label="Children" count={children} setCount={setChildren} />
          <GuestCategory label="Infants" count={infants} setCount={setInfants} />
          <GuestCategory label="Pets" count={pets} setCount={setPets} />
        </div>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full">
          Save
        </button>
      </div>
    </div>
  );
}

function GuestCategory({ label, count, setCount }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-medium">{label}</h3>
        <p className="text-sm text-gray-500">Ages {label === 'Children' ? '2-12' : label === 'Infants' ? 'Under 2' : '13 or above'}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => setCount(count - 1)}
          disabled={count === 0}
          className="bg-gray-300 text-gray-700 p-2 rounded-full"
        >
          -
        </button>
        <span className="mx-4">{count}</span>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-gray-300 text-gray-700 p-2 rounded-full"
        >
          +
        </button>
      </div>
    </div>
  );
}
