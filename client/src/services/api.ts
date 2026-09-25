const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('flowpilot_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Problems
  async getProblems() {
    const res = await fetch(`${API_BASE}/problems`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getProblem(id: string) {
    const res = await fetch(`${API_BASE}/problems/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async createProblem(data: any) {
    const res = await fetch(`${API_BASE}/problems`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateProblem(id: string, data: any) {
    const res = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteProblem(id: string) {
    const res = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async analyzeProblem(id: string) {
    const res = await fetch(`${API_BASE}/problems/${id}/analyze`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Workflows
  async getWorkflows() {
    const res = await fetch(`${API_BASE}/workflows`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getWorkflow(id: string) {
    const res = await fetch(`${API_BASE}/workflows/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async createWorkflow(data: any) {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateWorkflow(id: string, data: any) {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteWorkflow(id: string) {
    const res = await fetch(`${API_BASE}/workflows/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async generateWorkflowFromProblem(problemId: string) {
    const res = await fetch(`${API_BASE}/workflows/generate-from-problem/${problemId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async toggleWorkflowActive(id: string, active: boolean) {
    const endpoint = active ? 'activate' : 'deactivate';
    const res = await fetch(`${API_BASE}/workflows/${id}/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async executeWorkflow(id: string, inputData: any) {
    const res = await fetch(`${API_BASE}/workflows/${id}/execute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ input_data: inputData }),
    });
    return handleResponse<any>(res);
  },

  // Executions
  async getExecutions() {
    const res = await fetch(`${API_BASE}/executions`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getExecution(id: string) {
    const res = await fetch(`${API_BASE}/executions/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async retryExecution(id: string) {
    const res = await fetch(`${API_BASE}/executions/${id}/retry`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async cancelExecution(id: string) {
    const res = await fetch(`${API_BASE}/executions/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Tasks
  async getTasks(params?: { status?: string; priority?: string; assignee?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.assignee) query.append('assignee', params.assignee);
    const res = await fetch(`${API_BASE}/tasks?${query.toString()}`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getTask(id: string) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async createTask(data: any) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateTask(id: string, data: any) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async completeTask(id: string, comment?: string) {
    const res = await fetch(`${API_BASE}/tasks/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comment }),
    });
    return handleResponse<any>(res);
  },

  // Approvals
  async getApprovals(status?: string) {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/approvals${query}`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async approveApproval(id: string, comments?: string) {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comments }),
    });
    return handleResponse<any>(res);
  },

  async rejectApproval(id: string, comments?: string) {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comments }),
    });
    return handleResponse<any>(res);
  },

  // Analytics
  async getAnalyticsOverview() {
    const res = await fetch(`${API_BASE}/analytics/overview`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async getAnalyticsWorkflows() {
    const res = await fetch(`${API_BASE}/analytics/workflows`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  // Reports
  async getReports() {
    const res = await fetch(`${API_BASE}/reports`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async getReport(id: string) {
    const res = await fetch(`${API_BASE}/reports/${id}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async generateReport(data: { title: string; reportType: string }) {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return handleResponse<{ notifications: any[]; unreadCount: number }>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Audit
  async getAuditLogs(params?: { action?: string; entity_type?: string }) {
    const query = new URLSearchParams();
    if (params?.action) query.append('action', params.action);
    if (params?.entity_type) query.append('entity_type', params.entity_type);
    const res = await fetch(`${API_BASE}/audit?${query.toString()}`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  // Organization
  async getOrganization() {
    const res = await fetch(`${API_BASE}/organization`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  async getOrganizationMembers() {
    const res = await fetch(`${API_BASE}/organization/members`, { headers: getHeaders() });
    return handleResponse<any[]>(res);
  },

  async addOrganizationMember(data: any) {
    const res = await fetch(`${API_BASE}/organization/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateSettings(data: { geminiApiKey?: string }) {
    const res = await fetch(`${API_BASE}/organization/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async getAiStatus() {
    const res = await fetch(`${API_BASE}/ai/status`, { headers: getHeaders() });
    return handleResponse<{ active: boolean; hasApiKey: boolean; model: string; mode: string }>(res);
  },
};
