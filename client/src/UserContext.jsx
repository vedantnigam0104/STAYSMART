import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/profile');
        setUser(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Optionally handle specific error cases (e.g., token expired)
      } finally {
        setReady(true);
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setReady(true); // User is already present, so set ready
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
