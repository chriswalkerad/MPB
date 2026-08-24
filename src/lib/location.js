// The location persistence contract, shared between the app and the
// prerender script (which seeds the neutral state so crawlers get the
// national view). Changing key or shape here keeps both sides in sync.
export const LOCATION_STORAGE_KEY = 'mpb-location'

export const ALL_LOCATIONS = { region: null, city: null, label: 'All Locations' }
