import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">StaySmart</h2>
            <p className="text-gray-400">Your ideal place to stay.</p>
          </div>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <FaFacebookF size={24} />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <FaTwitter size={24} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <FaInstagram size={24} />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-400">&copy; 2024 StaySmart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

//{preInput('Rating', 'Rating for the place')}
       // <select value={rating} onChange={ev => setRating(ev.target.value)}>
         // <option value={1}>1</option>
          //<option value={2}>2</option>
          //<option value={3}>3</option>
          //<option value={4}>4</option>
          //<option value={5}>5</option>
        //</select>