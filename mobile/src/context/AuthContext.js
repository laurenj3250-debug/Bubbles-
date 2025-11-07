import React from 'react';

export const AuthContext = React.createContext({
  signIn: async (token, user) => {},
  signOut: async () => {},
  signUp: async (token, user) => {},
});
