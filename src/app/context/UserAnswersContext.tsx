// UserAnswersContext.tsx
"use client"
import React, { createContext, useState, ReactNode,useContext,useEffect} from 'react';

interface UserAnswersContextProps {
  answers: { [key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

 const UserAnswersContext = createContext<UserAnswersContextProps | undefined>(undefined);

export const UserAnswersProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  
  useEffect(() => {
    const savedAnswers = localStorage.getItem('userAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  return (
    <UserAnswersContext.Provider value={{ answers, setAnswers }}>
      {children}
    </UserAnswersContext.Provider>
  );
};

export const useUserAnswers = () => {
    const context = useContext(UserAnswersContext);
    if (!context) {
      throw new Error("useUserAnswers must be used within a UserAnswersProvider");
    }
    return context;
  };