"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Metro area groupings - nearby cities that should match each selectable city
export const METRO_AREAS = {
  // West Coast
  "Los Angeles": ["Los Angeles", "Pasadena", "Hollywood", "Anaheim", "Irvine", "Costa Mesa", "Culver City", "Santa Monica", "Carson", "Orange County", "Carlsbad"],
  "San Francisco": ["San Francisco", "San Francisco, CA", "Palo Alto", "Mountain View", "Santa Clara", "San Jose", "South San Francisco", "Berkeley", "Half Moon Bay", "Sunnyvale", "Oakland"],
  "San Diego": ["San Diego", "Chula Vista"],
  "Seattle": ["Seattle", "Bellevue", "Redmond"],
  "Portland": ["Portland", "Portland, OR"],

  // Southwest
  "Phoenix": ["Phoenix", "Phoenix, Arizona", "Mesa", "Mesa, Arizona", "Scottsdale", "Tempe, Arizona"],
  "Las Vegas": ["Las Vegas"],
  "Denver": ["Denver", "Denver, CO", "Colorado Springs", "Aurora", "Boulder"],

  // Midwest
  "Chicago": ["Chicago", "Schaumburg"],
  "Dallas": ["Dallas", "Dallas, TX", "Arlington", "Plano", "Grapevine", "Frisco"],
  "Houston": ["Houston"],
  "Austin": ["Austin", "College Station"],
  "Minneapolis": ["Minneapolis", "Saint Paul", "Prior Lake"],

  // Southeast
  "Miami": ["Miami", "Miami Beach", "Fort Lauderdale", "Boca Raton", "Dania Beach", "Coral Gables", "Sunny Isles Beach"],
  "Atlanta": ["Atlanta", "Sandy Springs"],
  "Tampa": ["Tampa", "Clearwater", "Orlando", "Lake Buena Vista", "Winter Park"],
  "Charlotte": ["Charlotte"],
  "Nashville": ["Nashville"],

  // Northeast
  "New York": ["New York", "New York, NY", "Brooklyn", "Brooklyn, NY", "Queens", "Newark", "New Rochelle"],
  "Boston": ["Boston", "Cambridge"],
  "Philadelphia": ["Philadelphia", "Philadelphia, PA", "King of Prussia"],
  "Washington": ["Washington", "Washington, DC", "National Harbor", "Reston", "McLean", "Tysons Corner", "Laurel", "Oxon Hill", "Arlington", "Alexandria", "Frederick"]
};

// City to state abbreviation mapping
export const CITY_STATES = {
  // West Coast
  "Los Angeles": "CA",
  "San Francisco": "CA",
  "San Diego": "CA",
  "Seattle": "WA",
  "Portland": "OR",

  // Southwest
  "Phoenix": "AZ",
  "Las Vegas": "NV",
  "Denver": "CO",

  // Midwest
  "Chicago": "IL",
  "Dallas": "TX",
  "Houston": "TX",
  "Austin": "TX",
  "Minneapolis": "MN",

  // Southeast
  "Miami": "FL",
  "Atlanta": "GA",
  "Tampa": "FL",
  "Charlotte": "NC",
  "Nashville": "TN",

  // Northeast
  "New York": "NY",
  "Boston": "MA",
  "Philadelphia": "PA",
  "Washington": "DC",
};

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
            const state = CITY_STATES[detectedCity] || "";
            const newLocation = {
              region,
              city: detectedCity,
              label: state ? `${detectedCity}, ${state}` : detectedCity,
            };
            setLocation(newLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
          } else {
            // City not in our regions, default to nearest or first region
            const defaultLocation = {
              region: "west-coast",
              city: "Los Angeles",
              label: "Los Angeles, CA",
            };
            setLocation(defaultLocation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocation));
          }
        } else {
          // API error, use default
          const defaultLocation = {
            region: "west-coast",
            city: "Los Angeles",
            label: "Los Angeles, CA",
          };
          setLocation(defaultLocation);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLocation));
        }
      } catch (error) {
        // Network error, use default
        const defaultLocation = {
          region: "west-coast",
          city: "Los Angeles",
          label: "Los Angeles, CA",
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
