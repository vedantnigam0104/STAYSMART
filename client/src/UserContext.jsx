import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      axios.get('http://localhost:4000/api/profile')
        .then(({ data }) => {
          console.log(data);
          setUser(data);
          setReady(true);
        })
        .catch(() => {
          setReady(true); // Ensure ready state is set even if there's an error
        });
    } else {
      setReady(true); // Ensure ready state is set if user is already present
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}
