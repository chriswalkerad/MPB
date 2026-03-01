"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation } from "../context/LocationContext";

// Format region key to display label
const formatRegionLabel = (region) => {
  return region
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function LocationSelector() {
  const { location, updateLocation, REGIONS } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (selection) => {
    updateLocation(selection);
    setIsOpen(false);
  };

  const handleAllLocations = () => {
    handleSelect({
      region: null,
      city: null,
      label: "All Locations",
    });
  };

  const handleVirtual = () => {
    handleSelect({
      region: "virtual",
      city: null,
      label: "Virtual",
    });
  };

  const handleCitySelect = (region, city) => {
    handleSelect({
      region,
      city,
      label: `${city}, ${formatRegionLabel(region)}`,
    });
  };

  const isActive = (checkRegion, checkCity) => {
    if (!location) return false;
    return location.region === checkRegion && location.city === checkCity;
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "6px",
          padding: "6px 12px",
          color: "white",
          fontFamily: "Outfit, sans-serif",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{location?.label || "Select Location"}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            minWidth: "220px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "rgba(20,20,20,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "8px 0",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* All Locations */}
          <button
            onClick={handleAllLocations}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: isActive(null, null) ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none",
              color: "white",
              fontFamily: "Outfit, sans-serif",
              fontSize: "14px",
              textAlign: "left",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive(null, null)) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(null, null)) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            All Locations
          </button>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.1)",
              margin: "8px 0",
            }}
          />

          {/* Regions and Cities */}
          {Object.entries(REGIONS).map(([regionKey, cities]) => (
            <div key={regionKey}>
              {/* Region Header */}
              <div
                style={{
                  padding: "8px 16px 4px",
                  fontSize: "11px",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {formatRegionLabel(regionKey)}
              </div>

              {/* Cities */}
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(regionKey, city)}
                  style={{
                    width: "100%",
                    padding: "8px 16px 8px 24px",
                    background: isActive(regionKey, city) ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    color: "white",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "14px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(regionKey, city)) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(regionKey, city)) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
