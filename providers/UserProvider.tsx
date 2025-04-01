"use client";

import { User } from "next-auth";
import { createContext, useContext, useState } from "react";

interface UserContextType {
  user?: User;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User;
}) => {
  const [user, setUser] = useState<User | undefined>(initialUser);
  return (
    <UserContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
