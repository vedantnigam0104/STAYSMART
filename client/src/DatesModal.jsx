import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DatesModal({ setDates }) {
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  });
  const [monthsAhead, setMonthsAhead] = useState(0);
  const [selectionMode, setSelectionMode] = useState('dates');

  const handleRangeChange = (ranges) => {
    setSelectedRange(ranges.selection);
  };

  const handleSave = () => {
    if (selectionMode === 'dates') {
      setDates({
        startDate: selectedRange.startDate.toISOString(),
        endDate: selectedRange.endDate.toISOString(),
      });
    } else {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setMonth(startDate.getMonth() + parseInt(monthsAhead));
      endDate.setMonth(endDate.getMonth() + parseInt(monthsAhead));
      setDates({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        monthsAhead: parseInt(monthsAhead),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl mb-4">Select Dates</h2>
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="dates"
              checked={selectionMode === 'dates'}
              onChange={() => setSelectionMode('dates')}
              className="mr-2"
            />
            Select Dates
          </label>
          <label>
            <input
              type="radio"
              value="months"
              checked={selectionMode === 'months'}
              onChange={() => setSelectionMode('months')}
              className="mr-2"
            />
            Plan in Advance
          </label>
        </div>
        {selectionMode === 'dates' ? (
          <DateRangePicker
            ranges={[selectedRange]}
            onChange={handleRangeChange}
          />
        ) : (
          <div className="mt-4">
            <label className="block mb-2">Planning to travel in how many months?</label>
            <select
              value={monthsAhead}
              onChange={(e) => setMonthsAhead(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value={0}>Select months</option>
              {[...Array(12).keys()].map((i) => (
                <option key={i} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                </option>
              ))}
            </select>
          </div>
        )}
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full">
          Save
        </button>
      </div>
    </div>
  );
}
