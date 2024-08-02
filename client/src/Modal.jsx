// Modal.jsx
export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl mb-4">{title}</h2>
          <div>{children}</div>
          <button onClick={onClose} className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }
  