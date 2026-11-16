import {
  UserSession,
  Donation,
  NgoProfile,
  VolunteerProfile,
  Delivery,
  Allocation,
  AnalyticsSummary,
  RouteResponse,
  RouteWaypoint,
} from '../types/mealmesh';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mealmesh_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<UserSession> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Login failed');
    localStorage.setItem('mealmesh_token', json.data.token);
    localStorage.setItem('mealmesh_user', JSON.stringify(json.data));
    return json.data;
  },

  async demoLogin(role: string): Promise<UserSession> {
    const res = await fetch(`${API_BASE}/auth/demo/${role}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Demo login failed');
    localStorage.setItem('mealmesh_token', json.data.token);
    localStorage.setItem('mealmesh_user', JSON.stringify(json.data));
    return json.data;
  },

  logout() {
    localStorage.removeItem('mealmesh_token');
    localStorage.removeItem('mealmesh_user');
  },

  getCurrentUser(): UserSession | null {
    const str = localStorage.getItem('mealmesh_user');
    return str ? JSON.parse(str) : null;
  },

  // Donations
  async getActiveDonations(): Promise<Donation[]> {
    const res = await fetch(`${API_BASE}/public/donations/active`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getRecentDonations(): Promise<Donation[]> {
    const res = await fetch(`${API_BASE}/public/donations/recent`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getMyDonations(): Promise<Donation[]> {
    const res = await fetch(`${API_BASE}/donor/my-donations`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async postDonation(data: Partial<Donation> & { hoursUntilExpiry?: number }): Promise<Donation> {
    let headers = getAuthHeader();
    if (!headers.Authorization) {
      try {
        await api.demoLogin('DONOR');
        headers = getAuthHeader();
      } catch (e) {
        console.warn('Auto demo login failed:', e);
      }
    }
    const res = await fetch(`${API_BASE}/donor/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to post donation');
    return json.data;
  },

  // Matching
  async matchDonation(donationId: string) {
    const res = await fetch(`${API_BASE}/matching/match-donation/${donationId}`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Matching failed');
    return json.data;
  },

  async claimDonation(donationId: string) {
    let headers = getAuthHeader();
    if (!headers.Authorization) {
      try {
        await api.demoLogin('NGO');
        headers = getAuthHeader();
      } catch (e) {
        console.warn('Auto demo login for NGO failed:', e);
      }
    }
    const res = await fetch(`${API_BASE}/ngo/claim/${donationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Claim failed');
    return json.data;
  },

  // Routing
  async getWaypoints(): Promise<RouteWaypoint[]> {
    const res = await fetch(`${API_BASE}/routing/waypoints`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async computeRoute(originId: string, destinationId: string, objective: 'distance' | 'time' = 'distance'): Promise<RouteResponse> {
    const res = await fetch(`${API_BASE}/routing/shortest-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originId, destinationId, optimizationObjective: objective }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Routing failed');
    return json.data;
  },

  async computeMultiStopRoute(waypointIds: string[], objective: 'distance' | 'time' = 'distance'): Promise<RouteResponse> {
    const res = await fetch(`${API_BASE}/routing/multi-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypointIds, optimizationObjective: objective }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Multi-stop routing failed');
    return json.data;
  },

  // NGO
  async getNgoProfile(): Promise<NgoProfile> {
    const res = await fetch(`${API_BASE}/ngo/profile`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.data;
  },

  async updateNgoCapacity(currentKg: number, maxKg: number): Promise<NgoProfile> {
    const res = await fetch(`${API_BASE}/ngo/capacity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ currentKg, maxKg }),
    });
    const json = await res.json();
    return json.data;
  },

  async getNgoAllocations(): Promise<Allocation[]> {
    const res = await fetch(`${API_BASE}/ngo/allocations`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  // Volunteer
  async getVolunteerDeliveries(): Promise<Delivery[]> {
    const res = await fetch(`${API_BASE}/volunteer/deliveries`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async updateDeliveryStatus(id: string, status: string): Promise<Delivery> {
    const res = await fetch(`${API_BASE}/volunteer/deliveries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Status update failed');
    return json.data;
  },

  // Admin
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.data || [];
  },

  async getAdminNgos() {
    const res = await fetch(`${API_BASE}/admin/ngos`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.data || [];
  },

  async verifyNgo(id: string, verified: boolean) {
    const res = await fetch(`${API_BASE}/admin/ngos/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ verified }),
    });
    const json = await res.json();
    return json.data;
  },

  async undoAdminAction(): Promise<string> {
    const res = await fetch(`${API_BASE}/admin/undo`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    return json.message;
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.data || [];
  },

  async getFleetDeliveries(): Promise<Delivery[]> {
    const res = await fetch(`${API_BASE}/admin/fleet-deliveries`, { headers: getAuthHeader() });
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async simulateUrgentDonation(): Promise<Donation> {
    const res = await fetch(`${API_BASE}/admin/simulate-urgent-donation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Simulation failed');
    return json.data;
  },

  async broadcastFleetAlert(message?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/admin/broadcast-fleet-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message: message || 'High priority dispatch alert.' }),
    });
    const json = await res.json();
    return json.message;
  },

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    const json = await res.json();
    return json.data;
  },

  // DSA Lab
  async executeDsaOperation(payload: {
    structure: string;
    operation: string;
    key?: string;
    value?: string;
    priority?: number;
    startNode?: string;
    targetNode?: string;
    metric?: string;
  }) {
    const res = await fetch(`${API_BASE}/dsa-lab/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'DSA execution failed');
    return json.data;
  },
};
