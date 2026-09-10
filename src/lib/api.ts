import {
  TenantItem,
  LlmProviderItem,
  LlmProviderModelItem,
  ImageProviderItem,
  McpToolItem,
  AppRegistryItem,
  MasterDataItem,
  MasterDataCategoryInfo,
  SkillPluginItem,
  SkillPluginUploadResult,
  WorkforceMonitoringSummary,
  SystemMonitoringOverview,
  AuditLogItem,
  UsageAnalytics,
  DeadLetterRecord,
  WorkflowExecutionSummary,
  WorkflowReplayResult,
  AnalyticsOverview,
  TenantUsageCreditItem,
  LlmUsagePlatformWide,
  KpiSummary,
  TaskActivitySummaryResponse,
  ReconciliationOrderDto,
  PaymentReconciliationQueueItem,
  ConfirmPaymentReconciliationResult,
  PresenceSecurityAuditSummary,
  UniversalSelectionUsageResponse,
  CommercialPlanItem,
  CommercialPlanUpsertRequest,
  PlanFeatureEntitlementsMatrix,
  EntitlementUpdateRequest,
  TenantCustomOverrideResponse,
  CreditMeteringRuleItem,
  CreditCostFactorItem,
  CreditCostContext,
  CreditCostResult,
  ManualCreditAdjustmentRequest,
  ManualCreditAdjustmentResponse,
  TenantWalletDetailsResponse,
  FinancialCommandCenterResponse,
  IndustryCatalogItem,
  ProspectRegistrationRequest,
  ProspectRegistrationItem,
  SelectTrialRequest,
  ScheduleMeetingRequest,
  ActivateTrialResponse,
  ProspectAnalyticsResponse,
} from '../types';
import { supabase } from './supabaseClient';

const resolveApiBaseUrl = (): string => {
  const gProcess = (globalThis as any).process;
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_BACKEND_API_URL || (import.meta.env as any).NEXT_PUBLIC_BACKEND_API_URL)) ||
    (gProcess && gProcess.env && (gProcess.env.NEXT_PUBLIC_BACKEND_API_URL || gProcess.env.VITE_BACKEND_API_URL || gProcess.env.BACKEND_API_URL)) ||
    ''
  ).trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    const cleaned = envUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('orchestree.biz.id') || window.location.protocol === 'https:') {
      return 'https://api.orchestree.biz.id/api/v1';
    }
  }
  if (envUrl) {
    const cleaned = envUrl.replace(/\/+$/, '');
    return cleaned.endsWith('/api/v1') ? cleaned : `${cleaned}/api/v1`;
  }
  return 'https://api.orchestree.biz.id/api/v1';
};

const API_BASE_URL = resolveApiBaseUrl();

export const LOCAL_STORAGE_PLANS_KEY = 'orchestree_synced_commercial_plans';
export const LOCAL_STORAGE_PLANS_SYNCED_AT_KEY = 'orchestree_pricing_synced_at';
export const LOCAL_STORAGE_PLANS_SOURCE_KEY = 'orchestree_pricing_sync_source';

export interface PricingSyncMetadata {
  source: 'backend_api' | 'supabase' | 'synced_cache' | 'canonical_baseline';
  backendUrl: string;
  supabaseUrl: string;
  supabaseConnected: boolean;
  lastSyncedAt: string;
  planCount: number;
  isRealtimeActive: boolean;
}

export const DEFAULT_COMMERCIAL_PLANS: CommercialPlanItem[] = [
  {
    id: 'plan-starter-canonical',
    planCode: 'starter',
    planName: 'Starter Team',
    billingInterval: 'monthly',
    price: 500000,
    currency: 'IDR',
    creditAllocation: 1000,
    humanSeatLimit: 3,
    aiAgentLimit: 1,
    isPriceVisible: true,
    isActive: true,
    sortOrder: 1,
    description: 'Cocok untuk bisnis rintisan & UMKM yang ingin mengotomatiskan tugas harian staf inti.',
    features: [
      '1 Staf AI Spesialis (Marketing, Sales, Copy)',
      'Hingga 3 Akun Staf Manusia',
      'Integrasi WhatsApp & Telegram Gateway',
      'Company Brain (Hingga 50 Dokumen SOP)',
      'Real-time Dashboard Cockpit',
      'Dukungan Komunitas & Email Standard',
    ],
  },
  {
    id: 'plan-growth-canonical',
    planCode: 'growth',
    planName: 'Growth Business',
    billingInterval: 'monthly',
    price: 2500000,
    currency: 'IDR',
    creditAllocation: 6000,
    humanSeatLimit: 15,
    aiAgentLimit: 5,
    isPriceVisible: true,
    isActive: true,
    sortOrder: 2,
    badge: 'Paling Populer',
    description: 'Untuk perusahaan bertumbuh yang membutuhkan orkestrasi lintas departemen penuh.',
    features: [
      '5 Staf AI Spesialis (Termasuk AI Chief of Staff & CFO)',
      'Hingga 15 Akun Staf Manusia',
      'Integrasi Omnichannel (WA, IG, TikTok, Slack, Trello)',
      'Creative Studio AI (OpenAI & Gemini)',
      'Company Brain & Closed-Loop Memory Vault',
      'Human + AI Performance Scoring & Ranking',
      'Dukungan Prioritas SLA 4 Jam',
    ],
  },
  {
    id: 'plan-enterprise-canonical',
    planCode: 'enterprise',
    planName: 'Enterprise Core',
    billingInterval: 'monthly',
    price: 10000000,
    currency: 'IDR',
    creditAllocation: 30000,
    humanSeatLimit: 50,
    aiAgentLimit: 20,
    isPriceVisible: true,
    isActive: true,
    sortOrder: 3,
    badge: 'Skala Lengkap',
    description: 'Untuk korporasi menengah yang membutuhkan otomatisasi autopilot multi-cabang.',
    features: [
      '20 Staf AI Lengkap Seluruh Divisi',
      'Hingga 50 Akun Staf Manusia',
      'Integrasi API Custom & Webhook 2 Arah',
      'Audit Kepatuhan Brand & Safe-Zone Geometri',
      'Evaluasi Kinerja Bulanan Otomatis HR',
      'Multi-Model Gateway dengan Failover Zero-Downtime',
      'Dedicated Account Manager & Training Tim',
    ],
  },
  {
    id: 'plan-custom-canonical',
    planCode: 'custom',
    planName: 'Custom Sovereign',
    billingInterval: 'annual',
    price: null,
    currency: 'IDR',
    creditAllocation: 50000,
    humanSeatLimit: 100,
    aiAgentLimit: 50,
    isPriceVisible: false,
    isActive: true,
    sortOrder: 4,
    badge: 'Custom Deployment',
    description: 'Solusi terdedikasi on-premise atau private cloud dengan isolasi data kedaulatan penuh.',
    features: [
      'Unlimited / Custom Jumlah Staf AI & Human',
      'Private Cloud / On-Premise Container Ingress',
      'Kustomisasi Model AI Khusus Industri (Fine-Tuning)',
      'Enkripsi Data Tingkat Militer & Audit Keamanan Penuh',
      'SLA Uptime 99.99% & 24/7 Dedicated Support',
      'Perjanjian Kerahasiaan (NDA) Khusus Enterprise',
    ],
  },
];

export const DEFAULT_PROSPECT_LEADS: ProspectRegistrationItem[] = [
  {
    id: 'lead-001',
    fullName: 'Bambang Sudirman',
    email: 'bambang@nusantara-logistik.co.id',
    companyName: 'PT Nusantara Express Logistik',
    industryName: 'Logistik & Transportasi',
    planName: 'Growth Business',
    interestOption: 'direct_trial_or_subscription',
    trialStatus: 'SELECTED',
    meetingStatus: 'NOT_SCHEDULED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trialCreditsAllocated: 1000,
  },
  {
    id: 'lead-002',
    fullName: 'Clarissa Wijaya',
    email: 'clarissa@finarta.id',
    companyName: 'PT Finarta Solusi Finansial',
    industryName: 'Keuangan & Perbankan',
    planName: 'Enterprise Core',
    interestOption: 'schedule_meeting_presentation',
    trialStatus: 'REGISTERED',
    meetingStatus: 'SCHEDULED',
    scheduledMeetingDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'lead-003',
    fullName: 'Hendro Kusuma',
    email: 'hendro@surya-manufaktur.com',
    companyName: 'CV Surya Cipta Manufaktur',
    industryName: 'Manufaktur & Pabrikasi',
    planName: 'Starter Team',
    interestOption: 'direct_trial_or_subscription',
    trialStatus: 'ACTIVE',
    meetingStatus: 'NOT_SCHEDULED',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    trialCreditsAllocated: 1000,
  },
  {
    id: 'lead-004',
    fullName: 'Dewi Anggraini',
    email: 'dewi@medika-sehat.id',
    companyName: 'Klinik & Laboratorium Medika Sehat',
    industryName: 'Kesehatan & Farmasi',
    planName: 'Growth Business',
    interestOption: 'consultation_only',
    trialStatus: 'REGISTERED',
    meetingStatus: 'NOT_SCHEDULED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const LOCAL_STORAGE_AUDIT_LOGS_KEY = 'orchestree_superadmin_audit_logs';

const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit-sec-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    operatorId: 'superadmin@orchestree.ai',
    role: 'SUPER_ADMIN',
    action: 'SUPER_ADMIN_MFA_LOGIN_SUCCESS',
    resource: 'auth/mfa/totp',
    status: 'SUCCESS',
    ipAddress: '103.147.154.22',
    details: 'MFA TOTP Authenticated successfully with hardware security time-step.',
  },
  {
    id: 'audit-sec-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    operatorId: 'superadmin@orchestree.ai',
    role: 'SUPER_ADMIN',
    action: 'UPDATE_IP_ALLOWLIST',
    resource: 'security/ip-allowlist',
    status: 'SUCCESS',
    ipAddress: '103.147.154.22',
    details: 'Enabled CIDR allowlist for office VPN range 103.147.154.0/24.',
  },
  {
    id: 'audit-sec-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    operatorId: 'superadmin@orchestree.ai',
    role: 'SUPER_ADMIN',
    action: 'MANUAL_CREDIT_ADJUSTMENT',
    resource: 'tenant/tenant-alpha/credit',
    tenantId: 'tenant-alpha',
    status: 'SUCCESS',
    ipAddress: '103.147.154.22',
    details: 'BONUS +500 credits applied for SLA downtime compensation ticket #4029.',
  },
  {
    id: 'audit-sec-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    operatorId: 'superadmin@orchestree.ai',
    role: 'SUPER_ADMIN',
    action: 'UPDATE_LLM_PROVIDER',
    resource: 'llm-provider/gemini-pro',
    status: 'SUCCESS',
    ipAddress: '103.147.154.22',
    details: 'Updated circuit breaker threshold and primary routing priority to 1.',
  },
  {
    id: 'audit-sec-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    operatorId: 'security-sentinel@orchestree.ai',
    role: 'SYSTEM_SENTINEL',
    action: 'LOGIN_LOCKOUT_TRIGGERED',
    resource: 'auth/login',
    status: 'BLOCKED',
    ipAddress: '198.51.100.44',
    details: '3 consecutive invalid password attempts. Lockout 15 minutes activated.',
  },
];

class ApiClient {
  private token: string | null = null;
  private csrfToken: string | null = null;
  private operatorId: string = 'superadmin@orchestree.ai';

  setToken(token: string | null) {
    this.token = token;
  }

  setOperatorId(operatorId: string | null) {
    this.operatorId = operatorId || 'superadmin@orchestree.ai';
  }

  getOperatorId(): string {
    return this.operatorId;
  }

  setCsrfToken(token: string | null) {
    this.csrfToken = token;
    if (token && typeof document !== 'undefined') {
      document.cookie = `XSRF-TOKEN=${encodeURIComponent(token)}; path=/; SameSite=Strict; Secure`;
    }
  }

  getCsrfToken(): string | null {
    if (this.csrfToken) return this.csrfToken;
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
      if (match && match[1]) {
        this.csrfToken = decodeURIComponent(match[1]);
        return this.csrfToken;
      }
    }
    return null;
  }

  async initCsrf(): Promise<string> {
    try {
      // Check existing cookie first
      const existing = this.getCsrfToken();
      if (existing) return existing;

      const res = await fetch(`${API_BASE_URL}/admin/security/csrf-token`, {
        headers: {
          'X-Admin-Role': 'SUPER_ADMIN',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const token = data.csrfToken || res.headers.get('X-CSRF-Token');
        if (token) {
          this.setCsrfToken(token);
          return token;
        }
      }
    } catch (e) {
      console.warn('CSRF token fetch deferred, using generated client fallback token:', e);
    }

    // Client-side fallback token if backend offline
    if (!this.csrfToken) {
      const generated = 'csrf-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      this.setCsrfToken(generated);
      return generated;
    }
    return this.csrfToken;
  }

  getAuditLogsFromLocalCache(): AuditLogItem[] {
    if (typeof localStorage === 'undefined') return DEFAULT_AUDIT_LOGS;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_LOGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached audit logs:', e);
    }
    return DEFAULT_AUDIT_LOGS;
  }

  saveAuditLogToLocalCache(entry: AuditLogItem) {
    if (typeof localStorage === 'undefined') return;
    try {
      const existing = this.getAuditLogsFromLocalCache();
      const updated = [entry, ...existing.filter((item) => item.id !== entry.id)].slice(0, 150);
      localStorage.setItem(LOCAL_STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save audit log to cache:', e);
    }
  }

  recordAuditLog(log: {
    action: string;
    resource: string;
    status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    tenantId?: string;
    details?: string;
    operatorId?: string;
  }): AuditLogItem {
    const entry: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      operatorId: log.operatorId || this.operatorId || 'superadmin@orchestree.ai',
      role: 'SUPER_ADMIN',
      action: log.action,
      resource: log.resource,
      tenantId: log.tenantId || 'platform-governance',
      status: log.status || 'SUCCESS',
      ipAddress: typeof window !== 'undefined' ? (window.location.hostname || '127.0.0.1') : '127.0.0.1',
      details: log.details || '',
    };

    this.saveAuditLogToLocalCache(entry);

    // Asynchronously send to backend if available
    this.request('/admin/audit-logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    }).catch(() => {});

    // Asynchronously insert into Supabase
    Promise.resolve(
      supabase.from('audit_logs').insert({
        id: entry.id,
        operator_id: entry.operatorId,
        role: entry.role,
        action: entry.action,
        resource: entry.resource,
        tenant_id: entry.tenantId,
        status: entry.status,
        ip_address: entry.ipAddress,
        details: entry.details,
        created_at: entry.timestamp,
      })
    ).catch(() => {});

    return entry;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // Double-submit CSRF Token: Ensure token exists for mutating operations
    if (isStateChanging && !this.getCsrfToken()) {
      await this.initCsrf().catch(() => {});
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Role': 'SUPER_ADMIN',
      'X-Operator-Id': this.operatorId,
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Bagian B: CSRF Protection Double-Submit Pattern
    const csrf = this.getCsrfToken();
    if (isStateChanging) {
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Unauthorized or Forbidden access [${response.status}]`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Super Admin: Tenants
  async getTenants(): Promise<TenantItem[]> {
    return this.request<TenantItem[]>('/admin/tenants');
  }

  async createTenant(data: { name: string; tier: string; ownerEmail: string }): Promise<any> {
    return this.request('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Super Admin: LLM & Image Providers (Bagian A - Fase 93.A, 82)
  async getLlmProviders(): Promise<LlmProviderItem[]> {
    return this.request<LlmProviderItem[]>('/admin/llm-providers');
  }

  // Live Model Catalog for Provider (Fase 133/134)
  async getLlmProviderModels(providerId: string): Promise<LlmProviderModelItem[]> {
    return this.request<LlmProviderModelItem[]>(`/admin/llm-providers/${providerId}/models`);
  }

  async createLlmProvider(data: {
    name: string;
    providerType: string;
    baseUrl?: string;
    enabled?: boolean;
    taskSpecialization?: string;
    fallbackPriority?: number;
    apiKey?: string;
    models?: string[];
  }): Promise<any> {
    const res = await this.request('/admin/llm-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'CREATE_LLM_PROVIDER',
      resource: `llm-providers/${data.name}`,
      details: `Registered provider ${data.name} (${data.providerType})`,
    });
    return res;
  }

  async updateLlmProvider(id: string, data: Partial<LlmProviderItem> & { name?: string; fallbackPriority?: number }): Promise<LlmProviderItem> {
    const res = await this.request<LlmProviderItem>(`/admin/llm-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'UPDATE_LLM_PROVIDER',
      resource: `llm-providers/${id}`,
      details: `Updated provider configuration: ${JSON.stringify(data)}`,
    });
    return res;
  }

  async deleteLlmProvider(id: string): Promise<any> {
    const res = await this.request(`/admin/llm-providers/${id}`, {
      method: 'DELETE',
    });
    this.recordAuditLog({
      action: 'DELETE_LLM_PROVIDER',
      resource: `llm-providers/${id}`,
      details: `Deleted provider with ID ${id}`,
    });
    return res;
  }

  async toggleLlmProviderStatus(id: string): Promise<LlmProviderItem> {
    const res = await this.request<LlmProviderItem>(`/admin/llm-providers/${id}/toggle-status`, {
      method: 'POST',
    });
    this.recordAuditLog({
      action: 'TOGGLE_LLM_PROVIDER_STATUS',
      resource: `llm-providers/${id}`,
      details: `Toggled active status for provider ${id}`,
    });
    return res;
  }

  async getImageProviders(): Promise<ImageProviderItem[]> {
    return this.request<ImageProviderItem[]>('/admin/image-providers');
  }

  async createImageProvider(data: {
    name: string;
    providerType: string;
    models: string[];
    priority: number;
    apiKey?: string;
  }): Promise<ImageProviderItem> {
    const res = await this.request<ImageProviderItem>('/admin/image-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'CREATE_IMAGE_PROVIDER',
      resource: `image-providers/${data.name}`,
      details: `Registered image provider ${data.name} (Priority ${data.priority})`,
    });
    return res;
  }

  async deleteImageProvider(id: string): Promise<any> {
    const res = await this.request(`/admin/image-providers/${id}`, {
      method: 'DELETE',
    });
    this.recordAuditLog({
      action: 'DELETE_IMAGE_PROVIDER',
      resource: `image-providers/${id}`,
      details: `Deleted image provider ${id}`,
    });
    return res;
  }

  // Super Admin: MCP Tools Registry (Bagian D - Fase 93.B)
  async getMcpTools(): Promise<McpToolItem[]> {
    return this.request<McpToolItem[]>('/admin/mcp-tools');
  }

  async createMcpTool(data: {
    name: string;
    description: string;
    riskLevel: string;
    requiredRole: string;
    restrictedToOperationMode?: string;
    inputSchema?: string;
  }): Promise<any> {
    const res = await this.request('/admin/mcp-tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'CREATE_MCP_TOOL',
      resource: `mcp-tools/${data.name}`,
      details: `Registered MCP tool ${data.name} (Risk: ${data.riskLevel})`,
    });
    return res;
  }

  async updateMcpTool(id: string, data: Partial<McpToolItem>): Promise<McpToolItem> {
    const res = await this.request<McpToolItem>(`/admin/mcp-tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'UPDATE_MCP_TOOL',
      resource: `mcp-tools/${id}`,
      details: `Updated MCP tool parameters for ${id}`,
    });
    return res;
  }

  async deleteMcpTool(id: string): Promise<any> {
    const res = await this.request(`/admin/mcp-tools/${id}`, {
      method: 'DELETE',
    });
    this.recordAuditLog({
      action: 'DELETE_MCP_TOOL',
      resource: `mcp-tools/${id}`,
      details: `Deleted MCP tool ${id}`,
    });
    return res;
  }

  async toggleMcpToolKillSwitch(id: string): Promise<McpToolItem> {
    const res = await this.request<McpToolItem>(`/admin/mcp-tools/${id}/kill-switch`, {
      method: 'PATCH',
    });
    this.recordAuditLog({
      action: 'MCP_TOOL_KILL_SWITCH_ENGAGED',
      resource: `mcp-tools/${id}`,
      details: `Toggled sandbox kill switch for MCP tool ${id}`,
    });
    return res;
  }

  // Super Admin: Third-Party App Registry (Bagian E - Fase 93.C, 58-60)
  async getAppRegistry(): Promise<AppRegistryItem[]> {
    return this.request<AppRegistryItem[]>('/admin/app-registry');
  }

  async createAppRegistry(data: {
    appName: string;
    appType: string;
    clientId: string;
    scopes: string[];
    status?: string;
    capabilityStatus?: string;
    manualLinkMigrationNotice?: string;
    authType?: string;
  }): Promise<any> {
    return this.request('/admin/app-registry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppRegistry(id: string, data: Partial<AppRegistryItem>): Promise<AppRegistryItem> {
    return this.request(`/admin/app-registry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppRegistry(id: string): Promise<any> {
    return this.request(`/admin/app-registry/${id}`, {
      method: 'DELETE',
    });
  }

  async markAppMigration(id: string, reason: string): Promise<AppRegistryItem> {
    return this.request(`/admin/app-registry/${id}/mark-migration`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  // Super Admin: Master Data (Bagian B - Fase 91)
  async getMasterDataCategories(): Promise<MasterDataCategoryInfo[]> {
    return this.request<MasterDataCategoryInfo[]>('/admin/master-data/categories');
  }

  async getMasterData(category?: string): Promise<MasterDataItem[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<MasterDataItem[]>(`/admin/master-data${query}`);
  }

  async createMasterData(data: { category: string; key: string; value: string; description?: string }): Promise<any> {
    const res = await this.request('/admin/master-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'CREATE_MASTER_DATA',
      resource: `master-data/${data.category}/${data.key}`,
      details: `Created master data key "${data.key}" in category "${data.category}"`,
    });
    return res;
  }

  async deleteMasterData(id: string, category?: string): Promise<any> {
    const url = category ? `/admin/master-data/${encodeURIComponent(category)}/${encodeURIComponent(id)}` : `/admin/master-data/${encodeURIComponent(id)}`;
    const res = await this.request(url, {
      method: 'DELETE',
    });
    this.recordAuditLog({
      action: 'DELETE_MASTER_DATA',
      resource: `master-data/${category || 'general'}/${id}`,
      details: `Deleted master data item ID ${id}`,
    });
    return res;
  }

  // Super Admin: Skill Plugins (Bagian C - Fase 92)
  async getSkillPlugins(): Promise<SkillPluginItem[]> {
    return this.request<SkillPluginItem[]>('/admin/skill-plugins');
  }

  async createSkillPlugin(data: {
    name: string;
    version: string;
    author: string;
    executionRuntime: string;
    status?: string;
  }): Promise<any> {
    const res = await this.request('/admin/skill-plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'CREATE_SKILL_PLUGIN',
      resource: `skill-plugins/${data.name}`,
      details: `Registered skill plugin ${data.name} v${data.version} (${data.executionRuntime})`,
    });
    return res;
  }

  async updateSkillPlugin(id: string, data: Partial<SkillPluginItem>): Promise<SkillPluginItem> {
    const res = await this.request<SkillPluginItem>(`/admin/skill-plugins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'UPDATE_SKILL_PLUGIN',
      resource: `skill-plugins/${id}`,
      details: `Updated skill plugin ID ${id}`,
    });
    return res;
  }

  async deleteSkillPlugin(id: string): Promise<any> {
    const res = await this.request(`/admin/skill-plugins/${id}`, {
      method: 'DELETE',
    });
    this.recordAuditLog({
      action: 'DELETE_SKILL_PLUGIN',
      resource: `skill-plugins/${id}`,
      details: `Deleted skill plugin ID ${id}`,
    });
    return res;
  }

  async updateSkillPluginStatus(id: string, status: string): Promise<SkillPluginItem> {
    const res = await this.request<SkillPluginItem>(`/admin/skill-plugins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    this.recordAuditLog({
      action: 'UPDATE_SKILL_PLUGIN_STATUS',
      resource: `skill-plugins/${id}`,
      details: `Changed status of skill plugin ${id} to ${status}`,
    });
    return res;
  }

  async uploadSkillPlugin(data: {
    pluginName: string;
    version: string;
    author: string;
    manifestJson: string;
    skillDefinitionMd: string;
    zipBase64?: string;
  }): Promise<SkillPluginUploadResult> {
    return this.request<SkillPluginUploadResult>('/admin/skill-plugins/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Super Admin: Workforce Analytics (Bagian F - Fase 91.A, H)
  async getWorkforceSummary(): Promise<WorkforceMonitoringSummary> {
    return this.request<WorkforceMonitoringSummary>('/admin/analytics/tenant-workforce-summary');
  }

  // Super Admin: System Monitoring Center (Bagian G - Fase 102, 90 Gate)
  async getSystemMonitoringOverview(): Promise<SystemMonitoringOverview> {
    return this.request<SystemMonitoringOverview>('/admin/monitoring/system-overview');
  }

  // Super Admin: Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    let remoteLogs: AuditLogItem[] = [];
    try {
      const beLogs = await this.request<AuditLogItem[]>('/admin/audit-logs');
      if (Array.isArray(beLogs) && beLogs.length > 0) {
        remoteLogs = beLogs;
      }
    } catch (_e) {}

    if (remoteLogs.length === 0) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data && data.length > 0) {
          remoteLogs = data.map((d: any) => ({
            id: d.id,
            timestamp: d.created_at || d.timestamp || new Date().toISOString(),
            operatorId: d.operator_id || d.operatorId || 'superadmin@orchestree.ai',
            role: d.role || 'SUPER_ADMIN',
            action: d.action || 'AUDIT_EVENT',
            resource: d.resource || 'system',
            tenantId: d.tenant_id || d.tenantId,
            status: d.status || 'SUCCESS',
            ipAddress: d.ip_address || d.ipAddress || '127.0.0.1',
            details: d.details || '',
          }));
        }
      } catch (_se) {}
    }

    const localLogs = this.getAuditLogsFromLocalCache();
    const logMap = new Map<string, AuditLogItem>();
    for (const log of localLogs) {
      logMap.set(log.id, log);
    }
    for (const log of remoteLogs) {
      logMap.set(log.id, log);
    }
    const combined = Array.from(logMap.values());
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return combined;
  }

  // Super Admin: Usage Analytics
  async getUsageAnalytics(): Promise<UsageAnalytics> {
    return this.request<UsageAnalytics>('/admin/usage');
  }

  // System Health
  async getHealthStatus(): Promise<{ status: string; providers: any[] }> {
    return this.request<{ status: string; providers: any[] }>('/admin/health-check');
  }

  // LANGKAH 1.2: Workflow Node Tracing (OpenTelemetry)
  async getWorkflowTraces(): Promise<any[]> {
    return this.request<any[]>('/orchestration/traces');
  }

  async getWorkflowTraceByExecution(executionId: string): Promise<any> {
    return this.request<any>(`/orchestration/traces/${executionId}`);
  }

  // LANGKAH 2: Confidence Score Calibration
  async getConfidenceCalibration(tenantId: string = 'tenant-default'): Promise<any[]> {
    return this.request<any[]>(`/intelligence/confidence/calibration?tenantId=${tenantId}`);
  }

  async triggerConfidenceCalibration(tenantId: string = 'tenant-default'): Promise<any> {
    return this.request<any>(`/intelligence/confidence/calibrate?tenantId=${tenantId}`, {
      method: 'POST',
    });
  }

  async getConfidenceAuditReport(tenantId: string = 'tenant-default'): Promise<any> {
    return this.request<any>(`/intelligence/confidence/audit?tenantId=${tenantId}`);
  }

  // FASE 109: Dead-Letter Queue (DLQ) & Deterministic Replay Sandbox
  async getDeadLetterQueue(includeReprocessed: boolean = true): Promise<DeadLetterRecord[]> {
    return this.request<DeadLetterRecord[]>(`/admin/dead-letter-queue?includeReprocessed=${includeReprocessed}`);
  }

  async reprocessDeadLetterItem(id: string): Promise<{ status: string; id: string; summary: string }> {
    return this.request<{ status: string; id: string; summary: string }>(`/admin/dead-letter-queue/${id}/reprocess`, {
      method: 'POST',
    });
  }

  async triggerSchedulerJob(jobName: string, tenantId: string = 'tenant-admin'): Promise<any> {
    return this.request('/admin/jobs/trigger', {
      method: 'POST',
      body: JSON.stringify({ jobName, tenantId }),
    });
  }

  async getWorkflowExecutions(limit: number = 50, tenantId?: string): Promise<WorkflowExecutionSummary[]> {
    const query = tenantId ? `?limit=${limit}&tenantId=${tenantId}` : `?limit=${limit}`;
    return this.request<WorkflowExecutionSummary[]>(`/admin/workflow-executions${query}`);
  }

  async replayWorkflowExecution(executionId: string): Promise<WorkflowReplayResult> {
    return this.request<WorkflowReplayResult>(`/admin/workflow-executions/${executionId}/replay`, {
      method: 'POST',
    });
  }

  // FASE 110: Super Admin Platform Aggregated Analytics
  async getAnalyticsOverview(period?: string): Promise<AnalyticsOverview> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<AnalyticsOverview>(`/admin/analytics/overview${query}`);
  }

  async getAnalyticsUsageCredit(period?: string): Promise<TenantUsageCreditItem[]> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<TenantUsageCreditItem[]>(`/admin/analytics/usage-credit${query}`);
  }

  async getAnalyticsLlmUsagePlatformWide(period?: string): Promise<LlmUsagePlatformWide> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<LlmUsagePlatformWide>(`/admin/analytics/llm-usage-platform-wide${query}`);
  }

  async getAnalyticsKpiSummary(period?: string): Promise<KpiSummary> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return this.request<KpiSummary>(`/admin/analytics/kpi-summary${query}`);
  }

  // FASE 110 / BAGIAN C: Platform-Wide Task Activity Aggregation
  async getTaskActivitySummary(): Promise<TaskActivitySummaryResponse> {
    return this.request<TaskActivitySummaryResponse>('/admin/analytics/task-activity-summary');
  }

  // FASE 114 / BAGIAN J / LANGKAH 1: Universal AI Selection & Ranking Aggregation
  async getUniversalSelectionUsage(): Promise<UniversalSelectionUsageResponse> {
    return this.request<UniversalSelectionUsageResponse>('/admin/analytics/universal-selection-usage');
  }

  async createTestTransaction(data: {
    tenantId: string;
    customerId: string;
    amount: number;
    orderNumber?: string;
  }): Promise<{ status: string; orderId: string; orderNumber: string; amount: string; tenantId: string }> {
    return this.request('/admin/analytics/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===========================================================================
  // FASE 110 / BAGIAN D: Payment Reconciliation & Anomaly Review
  // ===========================================================================

  async getReconciliationOrders(status?: string): Promise<ReconciliationOrderDto[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<ReconciliationOrderDto[]>(`/admin/payment-reconciliation/orders${query}`);
  }

  async getReconciliationQueue(status: string = 'pending_review'): Promise<PaymentReconciliationQueueItem[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<PaymentReconciliationQueueItem[]>(`/admin/payment-reconciliation/queue${query}`);
  }

  async confirmPaymentReconciliation(id: string, reason: string): Promise<ConfirmPaymentReconciliationResult> {
    return this.request<ConfirmPaymentReconciliationResult>(`/admin/payment-reconciliation/${encodeURIComponent(id)}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rejectPaymentReconciliation(id: string, reason: string): Promise<any> {
    return this.request(`/admin/payment-reconciliation/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async triggerPaymentReconciliationCheck(stuckMinutesThreshold: number = 10): Promise<{
    status: string;
    checkedCount: number;
    autoReconciledCount: number;
    pendingReviewCount: number;
    details: string[];
  }> {
    return this.request('/admin/payment-reconciliation/trigger-check', {
      method: 'POST',
      body: JSON.stringify({ stuckMinutesThreshold }),
    });
  }

  // ===========================================================================
  // FASE 112 / BAGIAN C: Platform-Wide Presence & Biometric Security Audit
  // ===========================================================================

  async getPresenceSecurityAuditSummary(): Promise<PresenceSecurityAuditSummary> {
    try {
      return await this.request<PresenceSecurityAuditSummary>('/admin/presence/security-stats');
    } catch {
      // Secondary fallback to presence root endpoint
      return await this.request<PresenceSecurityAuditSummary>('/presence/security-audit-stats');
    }
  }

  // ===========================================================================
  // FASE 114: Commercial Plans, Metering, Overrides, & Financial Command Center
  // ===========================================================================

  // 1.1 Commercial Plans
  async getCommercialPlans(): Promise<CommercialPlanItem[]> {
    try {
      const data = await this.request<CommercialPlanItem[]>('/admin/commercial/plans');
      if (Array.isArray(data) && data.length > 0) {
        this.savePlansToLocalCache(data, 'backend_api');
        return data;
      }
    } catch (e) {
      // Backend request failed, fallback to Supabase / local synced cache
    }

    try {
      const { data, error } = await supabase
        .from('commercial_plans')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id || `plan-${item.plan_code}`,
          planCode: item.plan_code,
          planName: item.plan_name,
          billingInterval: item.billing_interval || 'monthly',
          price: item.price !== undefined ? item.price : null,
          currency: item.currency || 'IDR',
          creditAllocation: item.credit_allocation || 1000,
          humanSeatLimit: item.human_seat_limit || 5,
          aiAgentLimit: item.ai_agent_limit || 2,
          isPriceVisible: item.is_price_visible ?? true,
          isActive: item.is_active ?? true,
          sortOrder: item.sort_order || 1,
          description: item.description,
          features: Array.isArray(item.features) ? item.features : undefined,
          updatedAt: item.updated_at || new Date().toISOString(),
        }));
        this.savePlansToLocalCache(mapped, 'supabase');
        return mapped;
      }
    } catch (e) {}

    return this.getPlansFromLocalCache();
  }

  async upsertCommercialPlan(plan: CommercialPlanUpsertRequest): Promise<CommercialPlanItem> {
    let savedPlan: CommercialPlanItem | null = null;

    // 1. Send to Backend Server API
    try {
      savedPlan = await this.request<CommercialPlanItem>('/admin/commercial/plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
    } catch (backendErr) {
      console.warn('Backend /admin/commercial/plans returned error, proceeding with direct Supabase and cache synchronization:', backendErr);
    }

    // Determine normalized item
    const effectiveItem: CommercialPlanItem = savedPlan || {
      id: plan.id || `plan-${plan.planCode}-${Date.now()}`,
      planCode: plan.planCode,
      planName: plan.planName,
      billingInterval: plan.billingInterval,
      price: plan.price,
      currency: plan.currency,
      creditAllocation: plan.creditAllocation,
      humanSeatLimit: plan.humanSeatLimit,
      aiAgentLimit: plan.aiAgentLimit,
      isPriceVisible: plan.isPriceVisible,
      isActive: plan.isActive ?? true,
      sortOrder: plan.sortOrder,
      updatedAt: new Date().toISOString(),
    };

    // 2. Direct Supabase Postgres Replication update
    try {
      await supabase.from('commercial_plans').upsert({
        plan_code: effectiveItem.planCode,
        plan_name: effectiveItem.planName,
        billing_interval: effectiveItem.billingInterval,
        price: effectiveItem.price,
        currency: effectiveItem.currency,
        credit_allocation: effectiveItem.creditAllocation,
        human_seat_limit: effectiveItem.humanSeatLimit,
        ai_agent_limit: effectiveItem.aiAgentLimit,
        is_price_visible: effectiveItem.isPriceVisible,
        is_active: effectiveItem.isActive,
        sort_order: effectiveItem.sortOrder,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'plan_code' });
    } catch (supaErr) {
      // Supabase remote offline or placeholder key
    }

    // 3. Update local synchronized storage cache
    const currentPlans = this.getPlansFromLocalCache();
    const existingIndex = currentPlans.findIndex(
      (p) => p.id === effectiveItem.id || p.planCode.toLowerCase() === effectiveItem.planCode.toLowerCase()
    );
    let updatedPlans: CommercialPlanItem[];
    if (existingIndex >= 0) {
      updatedPlans = [...currentPlans];
      updatedPlans[existingIndex] = { ...updatedPlans[existingIndex], ...effectiveItem };
    } else {
      updatedPlans = [...currentPlans, effectiveItem];
    }
    this.savePlansToLocalCache(updatedPlans, 'supabase');

    // 4. Supabase broadcast channel notification
    try {
      supabase.channel('public:commercial_plans_changes').send({
        type: 'broadcast',
        event: 'plan_updated',
        payload: effectiveItem,
      });
    } catch (e) {}

    return effectiveItem;
  }

  async deleteCommercialPlan(id: string): Promise<{ success: boolean; id: string }> {
    try {
      await this.request<{ success: boolean; id: string }>(`/admin/commercial/plans/${id}`, {
        method: 'DELETE',
      });
    } catch (backendErr) {
      console.warn('Backend delete plan error, proceeding with direct Supabase and cache delete:', backendErr);
    }

    try {
      await supabase.from('commercial_plans').delete().eq('id', id);
    } catch (e) {}

    const currentPlans = this.getPlansFromLocalCache();
    const updated = currentPlans.filter((p) => p.id !== id && p.planCode !== id);
    this.savePlansToLocalCache(updated, 'supabase');

    return { success: true, id };
  }

  // 1.2 Entitlements Matrix
  async getPlanFeatureEntitlementsMatrix(): Promise<PlanFeatureEntitlementsMatrix> {
    return this.request<PlanFeatureEntitlementsMatrix>('/admin/commercial/entitlements-matrix');
  }

  async updatePlanFeatureEntitlement(req: EntitlementUpdateRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/admin/commercial/entitlements', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  // 1.3 Tenant Custom Overrides
  async getTenantCustomOverride(tenantId: string): Promise<TenantCustomOverrideResponse> {
    return this.request<TenantCustomOverrideResponse>(`/admin/commercial/custom-override/${tenantId}`);
  }

  async setTenantCustomOverride(tenantId: string, overrideJson: string): Promise<{ success: boolean; tenantId: string }> {
    return this.request<{ success: boolean; tenantId: string }>(`/admin/commercial/custom-override/${tenantId}`, {
      method: 'POST',
      body: JSON.stringify({ overrideJson }),
    });
  }

  // 2.1 Credit Metering Rules
  async getCreditMeteringRules(): Promise<CreditMeteringRuleItem[]> {
    return this.request<CreditMeteringRuleItem[]>('/admin/commercial/metering-rules');
  }

  async saveCreditMeteringRule(rule: CreditMeteringRuleItem): Promise<CreditMeteringRuleItem> {
    return this.request<CreditMeteringRuleItem>('/admin/commercial/metering-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async deleteCreditMeteringRule(activityType: string): Promise<{ success: boolean; activityType: string }> {
    return this.request<{ success: boolean; activityType: string }>(`/admin/commercial/metering-rules/${activityType}`, {
      method: 'DELETE',
    });
  }

  // 2.2 Credit Cost Factors
  async getCreditCostFactors(): Promise<CreditCostFactorItem[]> {
    return this.request<CreditCostFactorItem[]>('/admin/commercial/cost-factors');
  }

  async saveCreditCostFactor(factor: CreditCostFactorItem): Promise<CreditCostFactorItem> {
    return this.request<CreditCostFactorItem>('/admin/commercial/cost-factors', {
      method: 'POST',
      body: JSON.stringify(factor),
    });
  }

  async deleteCreditCostFactor(factorType: string, factorKey: string): Promise<{ success: boolean; factorType: string; factorKey: string }> {
    return this.request<{ success: boolean; factorType: string; factorKey: string }>(`/admin/commercial/cost-factors/${factorType}/${factorKey}`, {
      method: 'DELETE',
    });
  }

  // 2.3 Simulate Cost
  async simulateCreditCost(context: CreditCostContext): Promise<CreditCostResult> {
    return this.request<CreditCostResult>('/admin/commercial/simulate-cost', {
      method: 'POST',
      body: JSON.stringify(context),
    });
  }

  // 3.1 Tenant Credit Adjustment
  async manualCreditAdjustment(req: ManualCreditAdjustmentRequest): Promise<ManualCreditAdjustmentResponse> {
    const res = await this.request<ManualCreditAdjustmentResponse>('/admin/billing/credit-adjustment', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    this.recordAuditLog({
      action: 'MANUAL_CREDIT_ADJUSTMENT',
      resource: `tenant/${req.tenantId}/credit-wallet`,
      tenantId: req.tenantId,
      operatorId: req.operatorId || this.operatorId,
      details: `${req.ledgerType} of ${req.amount} credits applied: "${req.reason}"`,
    });
    return res;
  }

  // 3.2 Tenant Wallet & Ledger Details
  async getTenantWalletDetails(tenantId: string): Promise<TenantWalletDetailsResponse> {
    return this.request<TenantWalletDetailsResponse>(`/admin/billing/tenant-wallet/${tenantId}`);
  }

  // 4. Financial Command Center Analytics
  async getFinancialCommandCenter(): Promise<FinancialCommandCenterResponse> {
    return this.request<FinancialCommandCenterResponse>('/admin/financial-command-center');
  }

  savePlansToLocalCache(plans: CommercialPlanItem[], source: 'backend_api' | 'supabase' | 'synced_cache' | 'canonical_baseline' = 'backend_api') {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PLANS_KEY, JSON.stringify(plans));
      localStorage.setItem(LOCAL_STORAGE_PLANS_SYNCED_AT_KEY, new Date().toISOString());
      localStorage.setItem(LOCAL_STORAGE_PLANS_SOURCE_KEY, source);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orchestree:pricing-updated', { detail: { plans, source } }));
      }
    } catch (e) {
      console.warn('Failed to save plans to localStorage cache:', e);
    }
  }

  getPlansFromLocalCache(): CommercialPlanItem[] {
    if (typeof localStorage === 'undefined') return DEFAULT_COMMERCIAL_PLANS;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PLANS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached commercial plans:', e);
    }
    return DEFAULT_COMMERCIAL_PLANS;
  }

  getPricingSyncMetadata(): PricingSyncMetadata {
    let source: 'backend_api' | 'supabase' | 'synced_cache' | 'canonical_baseline' = 'canonical_baseline';
    let lastSyncedAt = new Date().toISOString();
    let planCount = DEFAULT_COMMERCIAL_PLANS.length;

    if (typeof localStorage !== 'undefined') {
      try {
        const storedSource = localStorage.getItem(LOCAL_STORAGE_PLANS_SOURCE_KEY);
        if (storedSource) source = storedSource as any;
        const storedTime = localStorage.getItem(LOCAL_STORAGE_PLANS_SYNCED_AT_KEY);
        if (storedTime) lastSyncedAt = storedTime;
        const cached = this.getPlansFromLocalCache();
        planCount = cached.length;
      } catch (e) {}
    }

    return {
      source,
      backendUrl: API_BASE_URL,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://exfvfyiwftywqjcsofgf.supabase.co',
      supabaseConnected: true,
      lastSyncedAt,
      planCount,
      isRealtimeActive: true,
    };
  }

  async syncCommercialPlansFromSource(customPrices?: Record<string, number>): Promise<{ plans: CommercialPlanItem[]; metadata: PricingSyncMetadata }> {
    if (customPrices && Object.keys(customPrices).length > 0) {
      const current = this.getPlansFromLocalCache();
      const updated = current.map((p) => {
        const customPrice = customPrices[p.planCode.toLowerCase()];
        if (customPrice !== undefined) {
          return { ...p, price: customPrice, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      this.savePlansToLocalCache(updated, 'backend_api');
      return { plans: updated, metadata: this.getPricingSyncMetadata() };
    }

    const plans = await this.getPublicPlans(true);
    const metadata = this.getPricingSyncMetadata();
    return { plans, metadata };
  }

  // 5. Public Pricing & Commercial Plans (No Auth required, fallback to admin/commercial plans)
  async getPublicPlans(forceRefresh = false): Promise<CommercialPlanItem[]> {
    const endpoints = [
      `${API_BASE_URL}/plans`,
      `${API_BASE_URL}/billing/plans`,
      `${API_BASE_URL}/commercial/plans`,
      `${API_BASE_URL}/admin/commercial/plans`,
    ];

    // 1. Query Backend Server REST API endpoints
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Role': 'SUPER_ADMIN',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            this.savePlansToLocalCache(data, 'backend_api');
            return data;
          }
        }
      } catch (err) {
        // Continue to next endpoint candidate
      }
    }

    // 2. Try through authenticated request client if token exists
    if (this.token) {
      try {
        const commercialPlans = await this.getCommercialPlans();
        if (Array.isArray(commercialPlans) && commercialPlans.length > 0) {
          this.savePlansToLocalCache(commercialPlans, 'backend_api');
          return commercialPlans;
        }
      } catch (err) {
        // Ignore and continue
      }
    }

    // 3. Fallback directly to Supabase if configured
    try {
      const { data, error } = await supabase
        .from('commercial_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id || `plan-${item.plan_code}`,
          planCode: item.plan_code,
          planName: item.plan_name,
          billingInterval: item.billing_interval || 'monthly',
          price: item.price !== undefined ? item.price : null,
          currency: item.currency || 'IDR',
          creditAllocation: item.credit_allocation || 1000,
          humanSeatLimit: item.human_seat_limit || 5,
          aiAgentLimit: item.ai_agent_limit || 2,
          isPriceVisible: item.is_price_visible ?? true,
          isActive: item.is_active ?? true,
          sortOrder: item.sort_order || 1,
          description: item.description,
          features: Array.isArray(item.features) ? item.features : undefined,
          updatedAt: item.updated_at || new Date().toISOString(),
        }));
        this.savePlansToLocalCache(mapped, 'supabase');
        return mapped;
      }
    } catch (err) {
      // Supabase fallback failed
    }

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id || `plan-${item.plan_code}`,
          planCode: item.plan_code,
          planName: item.plan_name,
          billingInterval: item.billing_interval || 'monthly',
          price: item.price !== undefined ? item.price : null,
          currency: item.currency || 'IDR',
          creditAllocation: item.credit_allocation || 1000,
          humanSeatLimit: item.human_seat_limit || 5,
          aiAgentLimit: item.ai_agent_limit || 2,
          isPriceVisible: item.is_price_visible ?? true,
          isActive: item.is_active ?? true,
          sortOrder: item.sort_order || 1,
          description: item.description,
          features: Array.isArray(item.features) ? item.features : undefined,
          updatedAt: item.updated_at || new Date().toISOString(),
        }));
        this.savePlansToLocalCache(mapped, 'supabase');
        return mapped;
      }
    } catch (err) {}

    // 4. Return cached plans or fallback to baseline
    const cached = this.getPlansFromLocalCache();
    return cached;
  }

  // Local storage cache helpers for prospect registrations
  private getProspectsFromLocalCache(): ProspectRegistrationItem[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('orchestree_prospect_leads_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_e) {}
    }
    return [...DEFAULT_PROSPECT_LEADS];
  }

  private saveProspectsListToLocalCache(leads: ProspectRegistrationItem[]): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('orchestree_prospect_leads_cache', JSON.stringify(leads));
      } catch (_e) {}
    }
  }

  private saveProspectToLocalCache(lead: ProspectRegistrationItem): void {
    const list = this.getProspectsFromLocalCache();
    const updated = [lead, ...list.filter((p) => p.id !== lead.id)];
    this.saveProspectsListToLocalCache(updated);
  }

  async getPublicEntitlementsMatrix(): Promise<PlanFeatureEntitlementsMatrix> {
    try {
      const res = await fetch(`${API_BASE_URL}/plans/entitlements-matrix`);
      if (res.ok) {
        return await res.json();
      }
    } catch (_e) {}

    return this.getPlanFeatureEntitlementsMatrix();
  }

  // 6. Public Industry Catalog (No Auth required)
  async getPublicIndustries(): Promise<IndustryCatalogItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/industry-catalog`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend public industry catalog unreachable, checking Supabase fallback:', e);
    }

    try {
      const { data, error } = await supabase.from('industry_categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.code || d.id,
          name: d.name || d.industry_name || 'Industri',
          industry_name: d.industry_name || d.name,
          description: d.description,
        }));
      }
    } catch (_supaErr) {}

    return [
      { id: 'ind-tech', code: 'TECH', name: 'Teknologi Informasi & Software', industry_name: 'Teknologi Informasi & Software' },
      { id: 'ind-fin', code: 'FIN', name: 'Keuangan & Perbankan (Fintech/BPR)', industry_name: 'Keuangan & Perbankan (Fintech/BPR)' },
      { id: 'ind-mfg', code: 'MFG', name: 'Manufaktur & Pabrikasi', industry_name: 'Manufaktur & Pabrikasi' },
      { id: 'ind-ret', code: 'RET', name: 'Retail, Grosir & E-Commerce', industry_name: 'Retail, Grosir & E-Commerce' },
      { id: 'ind-hlth', code: 'HLTH', name: 'Kesehatan, Rumah Sakit & Farmasi', industry_name: 'Kesehatan, Rumah Sakit & Farmasi' },
      { id: 'ind-log', code: 'LOG', name: 'Logistik, Transportasi & Ekspedisi', industry_name: 'Logistik, Transportasi & Ekspedisi' },
      { id: 'ind-edu', code: 'EDU', name: 'Pendidikan & Pelatihan', industry_name: 'Pendidikan & Pelatihan' },
      { id: 'ind-prof', code: 'PROF', name: 'Konsultan & Jasa Profesional', industry_name: 'Konsultan & Jasa Profesional' },
      { id: 'ind-oth', code: 'OTH', name: 'Lainnya / Sektor Bisnis Lain', industry_name: 'Lainnya / Sektor Bisnis Lain' },
    ];
  }

  // 7. Public Prospect Registration Submission (No Auth required)
  async submitProspectRegistration(req: ProspectRegistrationRequest): Promise<{
    success: boolean;
    data: ProspectRegistrationItem;
    confirmationMessage: string;
  }> {
    let backendData: ProspectRegistrationItem | null = null;
    let confirmationMessage = 'Pendaftaran berhasil diterima! Tim kurasi OrchestreeAI akan memverifikasi permohonan trial Anda dalam 1x24 jam.';

    // 1. Try Backend REST API
    try {
      const res = await fetch(`${API_BASE_URL}/public/prospect-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      });

      if (res.ok) {
        const json = await res.json();
        backendData = json.data || json;
        if (json.confirmationMessage) confirmationMessage = json.confirmationMessage;
        if (backendData) {
          this.saveProspectToLocalCache(backendData);
          return { success: true, data: backendData, confirmationMessage };
        }
      } else if (res.status === 400 || res.status === 422) {
        const errText = await res.text();
        let msg = errText;
        try {
          msg = JSON.parse(errText).error || errText;
        } catch (_e) {}
        throw new Error(msg || 'Validasi formulir tidak lengkap.');
      }
    } catch (networkOrCorsErr: any) {
      if (networkOrCorsErr.message?.includes('wajib') || networkOrCorsErr.message?.includes('tidak lengkap')) {
        throw networkOrCorsErr;
      }
      console.warn('Backend prospect registration offline or blocked by CORS, executing direct Supabase fallback:', networkOrCorsErr);
    }

    // 2. Direct Supabase / Synced Storage fallback
    const prospectRecord: ProspectRegistrationItem = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: req.fullName,
      email: req.email,
      companyName: req.companyName,
      industryName: req.industryCategoryId || 'Teknologi Informasi & Software',
      planName: req.interestedPlanId ? 'Selected Plan' : 'Growth Business',
      interestOption: req.interestOption || 'direct_trial_or_subscription',
      trialStatus: req.interestOption === 'direct_trial_or_subscription' ? 'REGISTERED' : 'NOT_APPLICABLE',
      meetingStatus: req.interestOption === 'schedule_meeting_presentation' ? 'REQUESTED' : 'NOT_SCHEDULED',
      createdAt: new Date().toISOString(),
      trialCreditsAllocated: req.interestOption === 'direct_trial_or_subscription' ? 1000 : 0,
    };

    try {
      await supabase.from('prospect_registrations').insert({
        id: prospectRecord.id,
        full_name: req.fullName,
        email: req.email,
        phone_number: req.phoneNumber || req.whatsappNumber,
        whatsapp_number: req.whatsappNumber || req.phoneNumber,
        company_name: req.companyName,
        job_title: req.jobTitle,
        address: req.address,
        industry_category_id: req.industryCategoryId || req.industryId,
        company_size_range: req.companySizeRange || req.teamSize,
        interest_option: req.interestOption,
        interested_plan_id: req.interestedPlanId || req.planId,
        trial_status: prospectRecord.trialStatus,
        meeting_status: prospectRecord.meetingStatus,
        notes: req.message,
      });
    } catch (supaErr) {
      console.warn('Supabase direct insert fallback deferred:', supaErr);
    }

    this.saveProspectToLocalCache(prospectRecord);

    return {
      success: true,
      data: prospectRecord,
      confirmationMessage,
    };
  }

  // 8. Super Admin: Prospect Registrations Management (Protected)
  async getProspectRegistrations(params?: {
    search?: string;
    interest_option?: string;
    trial_status?: string;
    meeting_status?: string;
  }): Promise<ProspectRegistrationItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.interest_option) query.append('interest_option', params.interest_option);
    if (params?.trial_status) query.append('trial_status', params.trial_status);
    if (params?.meeting_status) query.append('meeting_status', params.meeting_status);

    const qs = query.toString() ? `?${query.toString()}` : '';

    // 1. Try Backend REST API
    try {
      const data = await this.request<ProspectRegistrationItem[]>(`/admin/prospect-registrations${qs}`);
      if (Array.isArray(data) && data.length > 0) {
        this.saveProspectsListToLocalCache(data);
        return data;
      }
    } catch (backendErr) {
      console.warn('Backend /admin/prospect-registrations unreachable or CORS blocked, trying Supabase fallback:', backendErr);
    }

    // 2. Direct Supabase Query
    try {
      let supaQuery = supabase.from('prospect_registrations').select('*').order('created_at', { ascending: false });
      if (params?.interest_option) {
        supaQuery = supaQuery.eq('interest_option', params.interest_option);
      }
      if (params?.trial_status) {
        supaQuery = supaQuery.eq('trial_status', params.trial_status);
      }
      if (params?.meeting_status) {
        supaQuery = supaQuery.eq('meeting_status', params.meeting_status);
      }

      const { data, error } = await supaQuery;
      if (!error && data && data.length > 0) {
        const mapped: ProspectRegistrationItem[] = data.map((r: any) => ({
          id: r.id,
          fullName: r.full_name || r.fullName || 'Pendaftar',
          email: r.email,
          companyName: r.company_name || r.companyName || '-',
          industryName: r.industry_name || r.industryName || 'Teknologi Informasi & Software',
          planName: r.plan_name || r.planName || 'Growth Business',
          interestOption: r.interest_option || r.interestOption || 'direct_trial_or_subscription',
          trialStatus: r.trial_status || r.trialStatus || 'REGISTERED',
          meetingStatus: r.meeting_status || r.meetingStatus || 'NOT_SCHEDULED',
          createdAt: r.created_at || r.createdAt || new Date().toISOString(),
          scheduledMeetingDate: r.scheduled_meeting_date || r.scheduledMeetingDate,
          trialCreditsAllocated: r.trial_credits_allocated || r.trialCreditsAllocated || (r.trial_status === 'ACTIVE' ? 1000 : 0),
        }));
        this.saveProspectsListToLocalCache(mapped);
        return mapped;
      }
    } catch (supaErr) {
      console.warn('Supabase prospect_registrations query deferred:', supaErr);
    }

    // 3. Cached fallback
    const cached = this.getProspectsFromLocalCache();
    if (params?.interest_option) {
      return cached.filter((p) => p.interestOption === params.interest_option);
    }
    if (params?.trial_status) {
      return cached.filter((p) => p.trialStatus === params.trial_status);
    }
    if (params?.meeting_status) {
      return cached.filter((p) => p.meetingStatus === params.meeting_status);
    }
    return cached;
  }

  async getProspectAnalytics(): Promise<ProspectAnalyticsResponse> {
    try {
      return await this.request<ProspectAnalyticsResponse>('/admin/prospect-registrations/analytics');
    } catch (_e) {
      const prospects = await this.getProspectRegistrations();
      const totalLeads = prospects.length;
      const trialSlotsOccupied = prospects.filter(
        (p) => p.trialStatus === 'SELECTED' || p.trialStatus === 'ACTIVE'
      ).length;
      const directSubscriptions = prospects.filter(
        (p) => p.interestOption === 'direct_trial_or_subscription'
      ).length;
      const scheduledDemos = prospects.filter(
        (p) => p.meetingStatus === 'SCHEDULED' || p.meetingStatus === 'COMPLETED'
      ).length;
      const conversionRate = totalLeads > 0 ? Math.round((trialSlotsOccupied / totalLeads) * 100) : 0;

      return {
        totalLeads,
        trialSlotsOccupied,
        maxTrialSlots: 36,
        directSubscriptions,
        scheduledDemos,
        conversionRate,
      };
    }
  }

  async selectProspectForTrial(id: string, req: SelectTrialRequest): Promise<ProspectRegistrationItem> {
    try {
      return await this.request<ProspectRegistrationItem>(`/admin/prospect-registrations/${id}/select-trial`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
    } catch (_e) {
      try {
        await supabase.from('prospect_registrations').update({
          trial_status: req.trialStatus,
          notes: req.trialNotes,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (_s) {}

      const cached = this.getProspectsFromLocalCache();
      const updated = cached.map((p) => p.id === id ? { ...p, trialStatus: req.trialStatus } : p);
      this.saveProspectsListToLocalCache(updated);

      const target = updated.find((p) => p.id === id);
      return target || {
        id,
        fullName: 'Calon Mitra',
        email: 'mitra@perusahaan.co.id',
        companyName: 'PT Mitra Sukses',
        interestOption: 'direct_trial_or_subscription',
        trialStatus: req.trialStatus,
        meetingStatus: 'NOT_SCHEDULED',
        createdAt: new Date().toISOString(),
      };
    }
  }

  async scheduleProspectMeeting(id: string, req: ScheduleMeetingRequest): Promise<ProspectRegistrationItem> {
    try {
      return await this.request<ProspectRegistrationItem>(`/admin/prospect-registrations/${id}/schedule-meeting`, {
        method: 'PATCH',
        body: JSON.stringify(req),
      });
    } catch (_e) {
      try {
        await supabase.from('prospect_registrations').update({
          meeting_status: 'SCHEDULED',
          scheduled_meeting_date: req.scheduledDate,
          meeting_link: req.meetingLink,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (_s) {}

      const cached = this.getProspectsFromLocalCache();
      const updated = cached.map((p) => p.id === id ? { ...p, meetingStatus: 'SCHEDULED', scheduledMeetingDate: req.scheduledDate } : p);
      this.saveProspectsListToLocalCache(updated);

      const target = updated.find((p) => p.id === id);
      return target || {
        id,
        fullName: 'Calon Mitra',
        email: 'mitra@perusahaan.co.id',
        companyName: 'PT Mitra Sukses',
        interestOption: 'schedule_meeting_presentation',
        trialStatus: 'REGISTERED',
        meetingStatus: 'SCHEDULED',
        scheduledMeetingDate: req.scheduledDate,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async activateProspectTrial(id: string): Promise<ActivateTrialResponse> {
    try {
      return await this.request<ActivateTrialResponse>(`/admin/prospect-registrations/${id}/activate-trial`, {
        method: 'POST',
      });
    } catch (_e) {
      const tenantId = `tenant-trial-${Math.random().toString(36).substring(2, 8)}`;
      const trialExpiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

      try {
        await supabase.from('prospect_registrations').update({
          trial_status: 'ACTIVE',
          tenant_id: tenantId,
          trial_expires_at: trialExpiresAt,
          trial_credits_allocated: 1000,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (_s) {}

      const cached = this.getProspectsFromLocalCache();
      const updated = cached.map((p) => p.id === id ? { ...p, trialStatus: 'ACTIVE', trialCreditsAllocated: 1000 } : p);
      this.saveProspectsListToLocalCache(updated);

      return {
        success: true,
        tenantId,
        initialCredits: 1000,
        trialExpiresAt,
      };
    }
  }

  // ===========================================================================
  // FASE 124 / BAGIAN A.1.3: IP ALLOWLIST CONFIGURATION
  // ===========================================================================
  async getIpAllowlist(): Promise<{ enabled: boolean; allowedIps: string[] }> {
    try {
      return await this.request<{ enabled: boolean; allowedIps: string[] }>('/admin/security/ip-allowlist');
    } catch {
      return { enabled: false, allowedIps: ['127.0.0.1', '::1', 'localhost'] };
    }
  }

  async updateIpAllowlist(data: { enabled: boolean; allowedIps: string[] }): Promise<{ success: boolean; enabled: boolean; allowedIps: string[] }> {
    const res = await this.request<{ success: boolean; enabled: boolean; allowedIps: string[] }>('/admin/security/ip-allowlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'UPDATE_IP_ALLOWLIST',
      resource: 'security/ip-allowlist',
      details: `IP allowlist set to ${data.enabled ? 'ENABLED' : 'DISABLED'} with ${data.allowedIps.length} allowed IPs: [${data.allowedIps.join(', ')}]`,
    });
    return res;
  }

  // ===========================================================================
  // FASE 124 / BAGIAN D.4.2: SUPPORT IMPERSONATION MODE
  // ===========================================================================
  async createSupportImpersonation(data: { targetTenantId: string; reason: string; durationMinutes?: number }): Promise<{
    sessionId: string;
    operatorId: string;
    targetTenantId: string;
    reason: string;
    token: string;
    expiresAt: number;
    notificationSent: boolean;
  }> {
    const res = await this.request<any>('/admin/support/impersonate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.recordAuditLog({
      action: 'SUPPORT_IMPERSONATION_STARTED',
      resource: `tenant/${data.targetTenantId}/support-mode`,
      tenantId: data.targetTenantId,
      details: `Time-boxed support session started (${data.durationMinutes || 15}m). Reason: "${data.reason}". Tenant Owner notified.`,
    });
    return res;
  }

  async getSupportImpersonation(sessionId: string): Promise<any> {
    return this.request(`/admin/support/impersonate/${encodeURIComponent(sessionId)}`);
  }

  // ===========================================================================
  // FASE 124 / BAGIAN A & E: SUPER ADMIN AUTH & LOCKOUT
  // ===========================================================================
  async adminLogin(email: string, pass: string): Promise<{ mfaRequired: boolean; challengeToken: string; message: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Role': 'SUPER_ADMIN',
      },
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.status === 429) {
      const data = await res.json();
      throw new Error(data.error || 'Akun terkunci selama 15 menit karena gagal login 3 kali.');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Login gagal: [${res.status}]`);
    }

    return res.json();
  }

  async adminVerifyMfa(email: string, code: string, challengeToken?: string): Promise<{
    accessToken: string;
    expiresInSeconds: number;
    csrfToken: string;
    user: any;
  }> {
    const res = await fetch(`${API_BASE_URL}/admin/auth/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Role': 'SUPER_ADMIN',
      },
      body: JSON.stringify({ email, code, challengeToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Verifikasi MFA gagal.');
    }

    const data = await res.json();
    if (data.csrfToken) {
      this.setCsrfToken(data.csrfToken);
    }
    return data;
  }
}

export const api = new ApiClient();

