// Filterable fields for Support
export const supportFilterables = ['subject', 'message'];

// Searchable fields for Support
export const supportSearchableFields = ['subject', 'message'];

// Helper function for set comparison
export const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
};