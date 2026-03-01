"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Region to cities mapping
export const REGIONS = {
  "west-coast": ["Los Angeles", "San Francisco", "San Diego", "Seattle", "Portland"],
  "southwest": ["Phoenix", "Las Vegas", "Denver"],
  "midwest": ["Chicago", "Dallas", "Houston", "Austin", "Minneapolis"],
  "southeast": ["Miami", "Atlanta", "Tampa", "Charlotte", "Nashville"],
  "northeast": ["New York", "Boston", "Philadelphia", "Washington"],
};

// Create reverse lookup: city -> region
const cityToRegion = {};
Object.entries(REGIONS).forEach(([region, cities]) => {
  cities.forEach((city) => {
    cityToRegion[city.toLowerCase()] = region;
  });
});

// Format region key to display label
const formatRegionLabel = (region) => {
  return region
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const STORAGE_KEY = "mpb-location";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeLocation = async () => {
      // Check localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocation(parsed);
          setLoading(false);
          return;
        } catch (e) {
          // Invalid stored data, continue to IP detection
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // Auto-detect via IP
      try {
        const response = await fetch("https://ip-api.com/json/");
        const data = await response.json();

        if (data.status === "success" && data.city) {
          const detectedCity = data.city;
          const region = cityToRegion[detectedCity.toLowerCase()];

          if (region) {
            // City is in our supported regions
            const newLocation = {
              region,
              city: detectedCity,
              label: `${detectedCity}, ${formatRegionLabel(region)}`,
            };
            setLocation(newLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
          } else {
            // City not in our regions, default to nearest or first region
            const defaultLocation = {
              region: "west-coast",
              city: "Los Angeles",
              label: "Los Angeles, West Coast",
            };
            setLocation(defaultLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocation));
          }
        } else {
          // API error, use default
          const defaultLocation = {
            region: "west-coast",
            city: "Los Angeles",
            label: "Los Angeles, West Coast",
          };
          setLocation(defaultLocation);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocation));
        }
      } catch (error) {
        // Network error, use default
        const defaultLocation = {
          region: "west-coast",
          city: "Los Angeles",
          label: "Los Angeles, West Coast",
        };
        setLocation(defaultLocation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocation));
      }

      setLoading(false);
    };

    initializeLocation();
  }, []);

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation, loading, REGIONS }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
