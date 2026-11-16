export type UserRole = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export interface UserSession {
  token: string;
  email: string;
  role: UserRole;
  fullName: string;
  userId: string;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  categoryName: string;
  foodType: 'COOKED' | 'RAW' | 'PACKAGED';
  dietaryType: 'VEG' | 'NON_VEG' | 'VEGAN';
  quantityKg: number;
  servings: number;
  cookedTime?: string;
  expiryTime: string;
  minutesRemaining: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'AVAILABLE' | 'RESERVED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXPIRED' | 'CANCELLED';
  storageTemperatureCelsius?: number;
  allergenInfo?: string;
  pickupInstructions?: string;
  donorName?: string;
  donorOrganization?: string;
  donorPhone?: string;
  locationName?: string;
  addressLine?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface NgoProfile {
  id: string;
  organizationName: string;
  registrationNumber: string;
  beneficiaryCount: number;
  dailyFoodRequirementKg: number;
  currentStorageCapacityKg: number;
  maxStorageCapacityKg: number;
  operatingHours: string;
  dietaryPreferences: string;
  verified: boolean;
  availableCapacityKg?: number;
}

export interface VolunteerProfile {
  id: string;
  vehicleType: string;
  vehicleNumber: string;
  maxCarryingCapacityKg: number;
  available: boolean;
  currentLatitude: number;
  currentLongitude: number;
  deliveriesCompleted: number;
}

export interface Delivery {
  id: string;
  status: 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE_PICKUP' | 'PICKED_UP' | 'EN_ROUTE_DROPOFF' | 'DELIVERED' | 'FAILED';
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  startTime?: string;
  pickupTime?: string;
  completionTime?: string;
  notes?: string;
  allocation?: {
    id: string;
    allocatedQuantityKg: number;
    matchScore: number;
    donation?: Donation;
    ngo?: NgoProfile;
  };
  volunteer?: VolunteerProfile;
}

export interface Allocation {
  id: string;
  allocatedQuantityKg: number;
  status: string;
  matchScore: number;
  matchedAt: string;
  donation?: Donation;
  ngo?: NgoProfile;
}

export interface AnalyticsSummary {
  totalFoodRescuedKg: number;
  totalMealsDistributed: number;
  totalPeopleFed: number;
  co2EmissionsSavedKg: number;
  financialValueInr: number;
  activeDonorsCount: number;
  registeredNgosCount: number;
  activeVolunteersCount: number;
  completedDeliveriesCount: number;
  rescuedByCategory: Array<{ category: string; quantityKg: number; percentage: number }>;
  weeklyTrend: Array<{ day: string; foodRescuedKg: number; deliveries: number }>;
}

export interface RouteWaypoint {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface RouteResponse {
  originId: string;
  originLabel: string;
  destinationId: string;
  destinationLabel: string;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  path: RouteWaypoint[];
  reachable: boolean;
  algorithmUsed: string;
}

export interface DsaLabStep {
  stepNumber: number;
  operation?: string;
  type?: string;
  description: string;
  currentVertexId?: string;
  targetVertexId?: string;
  edgeWeight?: number;
  tentativeDistance?: number;
  indexA?: number;
  indexB?: number;
  itemLabel?: string;
  key?: string;
  bucketIndex?: number;
  compositeScore?: number;
  allocatedKg?: number;
  remainingDonationKg?: number;
  rationale?: string;
  visited?: string[];
  frontier?: string[];
  currentQueue?: string[];
  currentStack?: string[];
}
