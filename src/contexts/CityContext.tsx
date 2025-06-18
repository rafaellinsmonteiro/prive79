
import React, { createContext, useContext, useState } from 'react';

interface CityContextType {
  selectedCityId: string | null;
  selectedCityName: string;
  setSelectedCity: (cityId: string | null, cityName: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedCityName, setSelectedCityName] = useState("Aracaju - SE");

  const setSelectedCity = (cityId: string | null, cityName: string) => {
    setSelectedCityId(cityId);
    setSelectedCityName(cityName);
  };

  return (
    <CityContext.Provider value={{ selectedCityId, selectedCityName, setSelectedCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
