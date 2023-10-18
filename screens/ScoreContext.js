import React, { createContext, useContext, useState } from "react";

const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [score, setScore] = useState("");

  const updateScore = (newScore) => {
    setScore(newScore);
  };

  return (
    <ScoreContext.Provider value={{ score, updateScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => {
  return useContext(ScoreContext);
};
