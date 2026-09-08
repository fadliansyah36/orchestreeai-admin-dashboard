import {
  TenantItem,
  LlmProviderItem,
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

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private token: string | null = null;
  private csrfToken: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  setCsrfToken(token: string | null) {
    this.csrfToken = token;
    if (token && typeof document !== 'undefined') {
      document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict; Secure`;
    }
  }

  async initCsrf(): Promise<string> {
    try {
      // Check existing cookie first
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        if (match && match[1]) {
          this.csrfToken = decodeURIComponent(match[1]);
          return this.csrfToken;
        }
      }

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // Double-submit CSRF Token: Ensure token exists for mutating operations
    if (isStateChanging && !this.csrfToken) {
      await this.initCsrf().catch(() => {});
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Role': 'SUPER_ADMIN',
      'X-Operator-Id': 'superadmin@orchestree.ai',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Bagian B: CSRF Protection Double-Submit Pattern
    if (isStateChanging && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
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
    return this.request('/admin/llm-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLlmProvider(id: string, data: Partial<LlmProviderItem> & { name?: string; fallbackPriority?: number }): Promise<LlmProviderItem> {
    return this.request(`/admin/llm-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLlmProvider(id: string): Promise<any> {
    return this.request(`/admin/llm-providers/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleLlmProviderStatus(id: string): Promise<LlmProviderItem> {
    return this.request(`/admin/llm-providers/${id}/toggle-status`, {
      method: 'POST',
    });
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
    return this.request('/admin/image-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteImageProvider(id: string): Promise<any> {
    return this.request(`/admin/image-providers/${id}`, {
      method: 'DELETE',
    });
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
    return this.request('/admin/mcp-tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMcpTool(id: string, data: Partial<McpToolItem>): Promise<McpToolItem> {
    return this.request(`/admin/mcp-tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMcpTool(id: string): Promise<any> {
    return this.request(`/admin/mcp-tools/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleMcpToolKillSwitch(id: string): Promise<McpToolItem> {
    return this.request(`/admin/mcp-tools/${id}/kill-switch`, {
      method: 'PATCH',
    });
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
    return this.request('/admin/master-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMasterData(id: string, category?: string): Promise<any> {
    const url = category ? `/admin/master-data/${encodeURIComponent(category)}/${encodeURIComponent(id)}` : `/admin/master-data/${encodeURIComponent(id)}`;
    return this.request(url, {
      method: 'DELETE',
    });
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
    return this.request('/admin/skill-plugins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSkillPlugin(id: string, data: Partial<SkillPluginItem>): Promise<SkillPluginItem> {
    return this.request(`/admin/skill-plugins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSkillPlugin(id: string): Promise<any> {
    return this.request(`/admin/skill-plugins/${id}`, {
      method: 'DELETE',
    });
  }

  async updateSkillPluginStatus(id: string, status: string): Promise<SkillPluginItem> {
    return this.request(`/admin/skill-plugins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
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
    return this.request<AuditLogItem[]>('/admin/audit-logs');
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

  async triggerSchedulerJob(jobName: string, tenantId: string = 'tenant-admin', simulateFailure: boolean = false): Promise<any> {
    return this.request('/admin/jobs/trigger', {
      method: 'POST',
      body: JSON.stringify({ jobName, tenantId, simulateFailure }),
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

  async simulateStuckPaymentAnomaly(): Promise<{
    status: string;
    orderId: string;
    paymentId: string;
    reference: string;
    reconciliationResult: string[];
  }> {
    return this.request('/admin/payment-reconciliation/simulate-stuck', {
      method: 'POST',
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
    return this.request<CommercialPlanItem[]>('/admin/commercial/plans');
  }

  async upsertCommercialPlan(plan: CommercialPlanUpsertRequest): Promise<CommercialPlanItem> {
    return this.request<CommercialPlanItem>('/admin/commercial/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async deleteCommercialPlan(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/admin/commercial/plans/${id}`, {
      method: 'DELETE',
    });
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
    return this.request<ManualCreditAdjustmentResponse>('/admin/billing/credit-adjustment', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  // 3.2 Tenant Wallet & Ledger Details
  async getTenantWalletDetails(tenantId: string): Promise<TenantWalletDetailsResponse> {
    return this.request<TenantWalletDetailsResponse>(`/admin/billing/tenant-wallet/${tenantId}`);
  }

  // 4. Financial Command Center Analytics
  async getFinancialCommandCenter(): Promise<FinancialCommandCenterResponse> {
    return this.request<FinancialCommandCenterResponse>('/admin/financial-command-center');
  }

  // 5. Public Pricing & Commercial Plans (No Auth required)
  async getPublicPlans(): Promise<CommercialPlanItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/plans`);
      if (res.ok) {
        return await res.json();
      }
      const fallback = await fetch(`${API_BASE_URL}/billing/plans`);
      if (fallback.ok) {
        return await fallback.json();
      }
      throw new Error(`Failed to fetch public plans: ${res.status}`);
    } catch (e) {
      console.warn('Direct public plans endpoint error, falling back:', e);
      throw e;
    }
  }

  async getPublicEntitlementsMatrix(): Promise<PlanFeatureEntitlementsMatrix> {
    const res = await fetch(`${API_BASE_URL}/plans/entitlements-matrix`);
    if (!res.ok) {
      throw new Error(`Failed to fetch public entitlements matrix: ${res.status}`);
    }
    return res.json();
  }

  // 6. Public Industry Catalog (No Auth required)
  async getPublicIndustries(): Promise<IndustryCatalogItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/public/industry-catalog`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch public industry catalog:', e);
      return [];
    }
  }

  // 7. Public Prospect Registration Submission (No Auth required)
  async submitProspectRegistration(req: ProspectRegistrationRequest): Promise<{
    success: boolean;
    data: ProspectRegistrationItem;
    confirmationMessage: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/public/prospect-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = errText;
      try {
        const parsed = JSON.parse(errText);
        msg = parsed.error || errText;
      } catch (_e) {}
      throw new Error(msg || `Submission failed with status ${res.status}`);
    }

    return res.json();
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
    return this.request<ProspectRegistrationItem[]>(`/admin/prospect-registrations${qs}`);
  }

  async getProspectAnalytics(): Promise<ProspectAnalyticsResponse> {
    return this.request<ProspectAnalyticsResponse>('/admin/prospect-registrations/analytics');
  }

  async selectProspectForTrial(id: string, req: SelectTrialRequest): Promise<ProspectRegistrationItem> {
    return this.request<ProspectRegistrationItem>(`/admin/prospect-registrations/${id}/select-trial`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
  }

  async scheduleProspectMeeting(id: string, req: ScheduleMeetingRequest): Promise<ProspectRegistrationItem> {
    return this.request<ProspectRegistrationItem>(`/admin/prospect-registrations/${id}/schedule-meeting`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
  }

  async activateProspectTrial(id: string): Promise<ActivateTrialResponse> {
    return this.request<ActivateTrialResponse>(`/admin/prospect-registrations/${id}/activate-trial`, {
      method: 'POST',
    });
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
    return this.request<{ success: boolean; enabled: boolean; allowedIps: string[] }>('/admin/security/ip-allowlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return this.request('/admin/support/impersonate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

