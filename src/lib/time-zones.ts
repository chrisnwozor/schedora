export const TIME_ZONE_OPTIONS = [
  { value: "America/St_Johns", label: "Newfoundland — St. John’s" },
  { value: "America/Halifax", label: "Atlantic — Halifax" },
  { value: "America/Toronto", label: "Eastern — Toronto" },
  { value: "America/Winnipeg", label: "Central — Winnipeg" },
  { value: "America/Edmonton", label: "Mountain — Edmonton" },
  { value: "America/Vancouver", label: "Pacific — Vancouver" },

  { value: "America/New_York", label: "US Eastern — New York" },
  { value: "America/Chicago", label: "US Central — Chicago" },
  { value: "America/Denver", label: "US Mountain — Denver" },
  { value: "America/Phoenix", label: "Arizona — Phoenix" },
  { value: "America/Los_Angeles", label: "US Pacific — Los Angeles" },

  { value: "Europe/London", label: "United Kingdom — London" },
  { value: "Europe/Paris", label: "Central Europe — Paris" },

  { value: "Africa/Douala", label: "Cameroon — Douala" },
  { value: "Africa/Lagos", label: "Nigeria — Lagos" },
  { value: "Africa/Johannesburg", label: "South Africa — Johannesburg" },

  { value: "Asia/Dubai", label: "United Arab Emirates — Dubai" },
  { value: "Asia/Kolkata", label: "India — Kolkata" },

  { value: "Australia/Sydney", label: "Australia — Sydney" },
  { value: "UTC", label: "UTC" },
] as const;

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
    }).format(new Date());

    return true;
  } catch {
    return false;
  }
}
