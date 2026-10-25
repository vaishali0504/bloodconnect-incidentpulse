export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type BloodComponent = 'Whole Blood' | 'Packed Red Cells' | 'Platelets' | 'Fresh Frozen Plasma' | 'Cryoprecipitate';

// Red Blood Cells Compatibility Matrix (Recipient <- Donor)
export const RED_CELL_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient
};

// Plasma Compatibility Matrix (Plasma reverses red cell rules)
export const PLASMA_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // AB is universal plasma donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

// Platelets Compatibility Matrix
export const PLATELET_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'A+', 'O-'],
  'A+': ['A+', 'A-', 'O+'],
  'B-': ['B-', 'B+', 'O-'],
  'B+': ['B+', 'B-', 'O+'],
  'AB-': ['AB-', 'AB+', 'A-', 'B-'],
  'AB+': ['AB+', 'AB-', 'A+', 'B+', 'O+'],
};

/**
 * Checks if a donor blood group is compatible for a recipient needing a specific component
 */
export function isBloodCompatible(
  recipientGroup: BloodGroup,
  donorGroup: BloodGroup,
  component: BloodComponent = 'Whole Blood'
): boolean {
  if (component === 'Fresh Frozen Plasma') {
    return (PLASMA_COMPATIBILITY[recipientGroup] || []).includes(donorGroup);
  }
  if (component === 'Platelets') {
    return (PLATELET_COMPATIBILITY[recipientGroup] || []).includes(donorGroup);
  }
  // Whole Blood & Packed Red Cells
  return (RED_CELL_COMPATIBILITY[recipientGroup] || []).includes(donorGroup);
}

/**
 * Get all compatible donor groups for a given recipient blood group
 */
export function getCompatibleDonorGroups(
  recipientGroup: BloodGroup,
  component: BloodComponent = 'Whole Blood'
): BloodGroup[] {
  if (component === 'Fresh Frozen Plasma') {
    return PLASMA_COMPATIBILITY[recipientGroup] || [];
  }
  if (component === 'Platelets') {
    return PLATELET_COMPATIBILITY[recipientGroup] || [];
  }
  return RED_CELL_COMPATIBILITY[recipientGroup] || [];
}

/**
 * Haversine formula to calculate distance in km between two GPS coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}
