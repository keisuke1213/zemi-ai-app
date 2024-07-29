// UserAnswersContext.tsx
"use client"
import React, { createContext, useState, ReactNode,useContext,useEffect} from 'react';

interface UserAnswersContextProps {
  answers: { [key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

 const UserAnswersContext = createContext<UserAnswersContextProps | undefined>(undefined);

export const UserAnswersProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>
  (() => {
    const savedAnswers = localStorage.getItem('userAnswers');
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  useEffect(() => {
    localStorage.setItem('userAnswers', JSON.stringify(answers));
  }, [answers]);


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