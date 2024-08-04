import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext.jsx";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AccountNav from "../AccountNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(null);
  const { ready, user, setUser } = useContext(UserContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '' // Add avatar to the profile state
  });
  const [newPassword, setNewPassword] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [error, setError] = useState(null);
  let { subpage } = useParams();

  if (subpage === undefined) {
    subpage = 'profile';
  }

  useEffect(() => {
    if (ready && user) {
      axios.get('/api/profile')
        .then(response => {
          setProfile(response.data);
          setAvatarBase64(response.data.avatar); // Set the current avatar
        })
        .catch(err => setError(err.message));
    }
  }, [ready, user]);

  async function logout() {
    try {
      await axios.post('http://localhost:4000/api/logout');
      sessionStorage.setItem('showReminderModal', 'false');
      sessionStorage.setItem('modalShown', 'false'); // Set a flag in session storage
      sessionStorage.clear();
      setUser(null);
      setRedirect('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAvatarBase64(reader.result);
    };
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const updatedProfile = { ...profile };
      if (avatarBase64) {
        updatedProfile.avatar = avatarBase64;
      }
      if (newPassword) {
        updatedProfile.newPassword = newPassword;
      }

      await axios.put('/api/profile', updatedProfile);
      alert('Profile updated successfully');
      setProfile(updatedProfile);
      setUser(updatedProfile);
      navigate('/account');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!ready) {
    return 'Loading...';
  }

  if (ready && !user && !redirect) {
    return <Navigate to={'/login'} />
  }

  if (redirect) {
    return <Navigate to={redirect} />
  }

  return (
    <div>
      <AccountNav />
      <div className="mt-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">Profile</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              readOnly
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">Avatar</label>
            <input
              type="file"
              id="avatar"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {avatarBase64 && (
              <img src={avatarBase64} alt="Avatar Preview" className="mt-4 w-32 h-32 rounded-full object-cover" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button onClick={logout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
