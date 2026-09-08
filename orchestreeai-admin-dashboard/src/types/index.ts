export type UserRole = 'SUPER_ADMIN' | 'TENANT_OWNER' | 'TENANT_ADMIN' | 'DEPT_MANAGER' | 'STAFF_HUMAN';

export interface AdminUserProfile {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  isMfaVerified: boolean;
  fullName?: string;
}

export interface TenantItem {
  id: string;
  name: string;
  tier: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONED';
  usersCount?: number;
  activeAgents?: number;
  createdAt?: string;
}

export interface LlmProviderItem {
  id?: string;
  provider: string;
  providerType?: string;
  models: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  priority: number;
  taskSpecialization?: string;
  apiKeySecretRef?: string;
  baseUrl?: string;
  isHealthy?: boolean;
}

export interface ImageProviderItem {
  id: string;
  name: string;
  providerType: string;
  models: string[];
  status: string;
  priority: number;
  apiKeySecretRef: string;
  latencyMs: number;
}

export interface McpToolItem {
  id?: string;
  name: string;
  description: string;
  inputSchema?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredRole: string;
  restrictedToOperationMode?: string;
  status: string;
  invocationCount24h?: number;
  errorCount24h?: number;
  avgLatencyMs24h?: number;
}

export interface AppRegistryItem {
  id: string;
  appName: string;
  appType: 'ERP' | 'CRM' | 'MARKETPLACE' | 'PAYMENT' | 'MESSAGING' | 'HRIS' | string;
  clientId: string;
  scopes: string[];
  status: 'ACTIVE' | 'PENDING' | 'REVOKED' | 'DEPRECATED' | 'INACTIVE' | string;
  capabilityStatus?: 'SUPPORTED' | 'DEPRECATED' | 'MIGRATION_REQUIRED' | 'MANUAL_LINK_ONLY' | string;
  manualLinkMigrationNotice?: string | null;
  authType?: string;
  connectedTenants?: number;
}

export interface MasterDataItem {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
}

export interface MasterDataCategoryInfo {
  categoryId: string;
  displayName: string;
  description: string;
  itemCount: number;
  keyLabel?: string;
  valueLabel?: string;
}

export interface SkillPluginItem {
  id: string;
  name: string;
  version: string;
  author: string;
  runtime: 'WASM' | 'JVM_NATIVE' | 'PYTHON_CONTAINER' | string;
  status: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED' | 'DEPRECATED' | string;
  downloads: number;
  declaredTools?: string[];
  riskScore?: number;
}

export interface SkillPluginUploadResult {
  success: boolean;
  pluginId: string;
  pluginName: string;
  version: string;
  securityScanPassed: boolean;
  declaredTools: string[];
  validationErrors?: string[];
  status: string;
}

export interface WorkforceMonitoringSummary {
  totalActiveDepartments: number;
  totalAiAgents: number;
  humanToAiRatio: string;
  departmentDistribution: Array<{
    departmentName: string;
    count: number;
    percentage: number;
  }>;
  aiJobTitleDistribution: Array<{
    jobTitle: string;
    count: number;
    percentage: number;
  }>;
}

export interface SystemMonitoringOverview {
  status: string;
  uptimeSeconds: number;
  timestamp: number;
  providerHealth: Array<{
    provider: string;
    isHealthy: boolean;
    latencyMs: number;
    consecutiveFailures: number;
    circuitBreakerTripped: boolean;
  }>;
  serverHealth: {
    podStatus: string;
    cpuUsagePercent: number;
    memoryUsageMb: number;
    memoryMaxMb: number;
    activeConnections: number;
  };
  jobQueueStatus: {
    activeJobs: number;
    deadLetterCount: number;
    processedJobs24h: number;
    failureRatePercent: number;
  };
  securityIncidents: {
    suspiciousAuthAttempts24h: number;
    abacViolations24h: number;
    highRiskMcpExecutions24h: number;
    biometricAnomalies24h: number;
  };
  rateLimitViolations: {
    totalViolations24h: number;
    topViolatingTenants: string[];
    currentThrottleState: string;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED';
}

export interface UsageAnalytics {
  totalTokens: number;
  totalCostUsd: number;
  breakdown: Array<{
    tenant: string;
    tokens: number;
    costUsd: number;
  }>;
}

export interface DeadLetterRecord {
  id: string;
  jobType: string;
  originalPayload: string;
  failureReason?: string;
  failedAt: number;
  reprocessed: boolean;
  reprocessedAt?: number;
  reprocessResult?: string;
}

export interface WorkflowExecutionSummary {
  id: string;
  tenantId: string;
  workflowDefId: string;
  startNodeId: string;
  lastCompletedNodeId?: string;
  executionStatus: string;
  currentStateSnapshot?: string;
  resultSummary?: string;
  executedAt: number;
}

export interface WorkflowReplayResult {
  replayExecutionId: string;
  originalExecutionId: string;
  workflowDefId: string;
  status: string;
  isDeterministicMatch: boolean;
  originalOutput: string;
  replayOutput: string;
  nodeRuns: Array<{
    nodeId: string;
    nodeType: string;
    status: string;
    input?: string;
    output?: string;
    errorMessage?: string;
    durationMs: number;
    timestamp: number;
  }>;
  sandboxDetails: Record<string, string>;
  durationMs: number;
}

// =============================================================================
// FASE 110: Super Admin Platform Aggregated Analytics Types
// =============================================================================

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsOverview {
  total_transaction_value: number;
  total_revenue_this_month: number;
  total_tenants_active: number;
  total_staff_human: number;
  total_ai_agents_active: number;
  total_repeat_orders: number;
  total_transactions: number;
}

export interface TenantUsageCreditItem {
  id: string;
  name: string;
  balance: number;
  total_usage_this_month: number;
}

export interface ProviderUsageSummary {
  provider: string;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export interface TenantLlmUsageSummary {
  tenant_id: string;
  tenant_name: string;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export interface DailyLlmTrendItem {
  date: string;
  total_tokens: number;
  total_cost_usd: number;
  request_count: number;
}

export interface LlmUsagePlatformWide {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  breakdown_by_provider: ProviderUsageSummary[];
  breakdown_by_tenant: TenantLlmUsageSummary[];
  daily_trend: DailyLlmTrendItem[];
}

export interface KpiMetricsBreakdown {
  completion_rate: number;
  quality_score: number;
  deadline_discipline: number;
  productivity_volume: number;
  collaboration_score: number;
  attendance_uptime: number;
}

export interface EntityKpiSummary {
  count: number;
  average_score: number;
  completion_rate: number;
  quality_score: number;
  discipline_or_uptime: number;
}

export interface KpiSummary {
  platform_average_score: number;
  tenants_count: number;
  total_evaluated_entities: number;
  average_metrics: KpiMetricsBreakdown;
  human_distribution: EntityKpiSummary;
  ai_agent_distribution: EntityKpiSummary;
  tier_distribution: Record<string, number>;
}

// =============================================================================
// FASE 110 / BAGIAN C: Platform-Wide Task Activity Summary (Addendum 2, Bagian 25.2)
// =============================================================================

export interface TenantTaskActivitySummaryItem {
  tenant_id: string;
  tenant_name: string;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  human_created_tasks: number;
  ai_agent_created_tasks: number;
  orchestration_created_tasks: number;
  completion_rate: number;
  adoption_health_status: 'HEALTHY' | 'MODERATE' | 'LOW_ACTIVITY' | string;
}

export interface TaskActivitySummaryResponse {
  total_tasks: number;
  total_active_tasks: number;
  total_completed_tasks: number;
  overall_completion_rate: number;
  human_created_tasks: number;
  ai_created_tasks: number;
  human_ratio_percentage: number;
  ai_ratio_percentage: number;
  by_status: Record<string, number>;
  by_channel: Record<string, number>;
  tenants_activity: TenantTaskActivitySummaryItem[];
}


// =============================================================================
// FASE 110: Payment Reconciliation & Anomaly Review Types
// =============================================================================

export interface ReconciliationOrderDto {
  id: string;
  orderNumber: string;
  tenantId: string;
  tenantName?: string;
  customerId: string;
  amount: number;
  status: string;
  createdAt: number;
  durationMinutes: number;
  isStuckAnomaly: boolean;
  paymentGatewayRef?: string;
}

export interface PaymentReconciliationQueueItem {
  id: string;
  paymentId: string;
  orderId: string;
  tenantId: string;
  detectedIssue: string;
  gatewayReportedStatus?: string;
  localStatus?: string;
  resolutionStatus: 'pending_review' | 'resolved_confirmed' | 'resolved_rejected';
  resolvedBySuperAdminId?: string;
  resolvedBy?: string;
  resolutionReason?: string;
  resolvedAt?: number;
  createdAt: number;
  orderAmount?: number;
  gatewayAmount?: number;
}

export interface ConfirmPaymentReconciliationResult {
  status: string;
  queueId: string;
  orderId: string;
  paymentId: string;
  resolvedBySuperAdminId: string;
  resolvedBy: string;
  reason: string;
  orderStatus: string;
  paymentStatus: string;
  resolvedAt: number;
}

// =============================================================================
// FASE 112 / BAGIAN C: Platform-Wide Presence & Biometric Security Audit Types
// =============================================================================

export interface PresenceMethodBreakdown {
  face: number;
  fingerprint: number;
  passwordFallback?: number;
}

export interface PresenceSecurityAuditSummary {
  totalEnrolledUsers: number;
  totalVerificationChecks: number;
  totalSuccessfulChecks: number;
  totalFailedChecks: number;
  consecutiveFailures: number;
  potentialUnauthorizedAttempts: number;
  methodBreakdown: PresenceMethodBreakdown;
  lastIncidentTimestamp?: number | null;
  lastSuccessfulCheckTimestamp?: number | null;
  securityRiskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' | string;
}

// =============================================================================
// FASE 114 / BAGIAN J / LANGKAH 1: Universal AI Selection & Ranking Usage Aggregation
// GET /api/v1/admin/analytics/universal-selection-usage
// (Addendum 2 Bagian 25.2: Agregat Platform — Privasi Tenant Terjaga)
// =============================================================================

export interface TenantSelectionUsageItem {
  tenant_id: string;
  tenant_name: string;
  total_requests: number;
  completed_requests: number;
  processing_requests: number;
  failed_requests: number;
  total_credits_consumed: number;
  last_activity_at?: string | null;
}

export interface DomainCategoryUsageItem {
  category: string;
  count: number;
  percentage: number;
}

export interface UniversalSelectionUsageResponse {
  total_requests: number;
  total_completed_requests: number;
  total_processing_requests: number;
  total_failed_requests: number;
  total_credits_consumed: number;
  most_used_domain_category: string;
  domain_categories: DomainCategoryUsageItem[];
  tenants_usage: TenantSelectionUsageItem[];
  privacy_notice: string;
}

// =============================================================================
// FASE 114: Commercial Plans, Credit Metering, Adjustments & Financial Command
// =============================================================================

export interface CommercialPlanItem {
  id: string;
  planCode: string;
  planName: string;
  billingInterval: 'monthly' | 'annual' | string;
  price: number | null;
  currency: string;
  creditAllocation: number;
  humanSeatLimit: number;
  aiAgentLimit: number;
  isPriceVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommercialPlanUpsertRequest {
  id?: string;
  planCode: string;
  planName: string;
  billingInterval: string;
  price: number | null;
  currency?: string;
  creditAllocation: number;
  humanSeatLimit: number;
  aiAgentLimit: number;
  isPriceVisible?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PlanFeatureEntitlementsMatrix {
  planCodes: string[];
  featureKeys: string[];
  matrix: Record<string, Record<string, string>>;
}

export interface EntitlementUpdateRequest {
  planCode: string;
  featureKey: string;
  value: string;
}

export interface TenantCustomOverrideRequest {
  overrideJson: string;
}

export interface TenantCustomOverrideResponse {
  tenantId: string;
  customEntitlementOverride: string | null;
}

export interface CreditMeteringRuleItem {
  activityType: string;
  baseWorkUnitMin: number;
  baseWorkUnitMax: number;
  unitType: string;
  description: string;
}

export interface CreditCostFactorItem {
  factorType: string;
  factorKey: string;
  factorValue: number;
  description: string;
}

export interface CreditCostContext {
  activityType: string;
  complexityLevel: string;
  modelUsed: string;
  toolsInvoked: number;
  executionType: string;
}

export interface CreditCostResult {
  estimatedCost: number;
  breakdown: Record<string, number>;
}

export interface ManualCreditAdjustmentRequest {
  tenantId: string;
  amount: number;
  ledgerType: string; // 'BONUS' | 'REVERT' | 'MANUAL_ADJUSTMENT' | 'TOPUP'
  reason: string;
  operatorId: string;
}

export interface ManualCreditAdjustmentResponse {
  status: string;
  tenantId: string;
  amount: number;
  ledgerType: string;
  newAvailableBalance: number;
  operatorId: string;
  reason: string;
  wallet?: any;
}

export interface AiCreditWalletItem {
  tenantId: string;
  subscriptionBalance: number;
  topupBalance: number;
  bonusBalance: number;
  reservedBalance: number;
  usedBalance: number;
  availableBalance: number;
  updatedAt?: string;
}

export interface AiCreditLedgerItem {
  id: string;
  tenantId: string;
  amount: number;
  ledgerType: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface TenantWalletDetailsResponse {
  wallet: AiCreditWalletItem;
  availableBalance: number;
  totalLedger: number;
  entries: AiCreditLedgerItem[];
}

export interface FinancialKpis {
  mrr: number;
  arr: number;
  activeSubscriptionsCount: number;
  totalCreditsCirculating: number;
  totalCreditsConsumed: number;
  totalRevenueIdr: number;
  estimatedComputeCostIdr: number;
  netMarginPercentage: number;
}

export interface PlanDistributionItem {
  planCode: string;
  planName: string;
  count: number;
  percentage: number;
}

export interface TopTenantConsumptionItem {
  tenantId: string;
  tenantName: string;
  planCode: string;
  creditsConsumed: number;
  percentageOfTotal: number;
}

export interface FinancialCommandCenterResponse {
  kpis: FinancialKpis;
  planDistribution: PlanDistributionItem[];
  topTenantsByConsumption: TopTenantConsumptionItem[];
  recentTopUpsTotal: number;
  timestamp: string;
}

// =============================================================================
// FASE 127: Prospect Registrations & Public Lead Capture System
// =============================================================================

export interface IndustryCatalogItem {
  id: string;
  industry_name: string;
  industry_code?: string;
  description?: string;
}

export type InterestOptionType =
  | 'schedule_meeting_presentation'
  | 'direct_trial_or_subscription';

export type TrialSelectionStatus =
  | 'not_selected'
  | 'selected_for_trial'
  | 'trial_activated'
  | 'rejected';

export type MeetingStatus =
  | 'not_scheduled'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface ProspectRegistrationRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  address?: string;
  companyName: string;
  jobTitle: string;
  industryCategoryId?: string;
  companySizeRange?: string;
  interestOption: InterestOptionType;
  interestedPlanId?: string;
  captchaToken?: string;
}

export interface ProspectRegistrationItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string | null;
  address?: string | null;
  companyName: string;
  jobTitle: string;
  industryCategoryId?: string | null;
  industryName?: string | null;
  companySizeRange?: string | null;
  interestOption: InterestOptionType;
  interestedPlanId?: string | null;
  interestedPlanName?: string | null;
  trialSelectionStatus: TrialSelectionStatus;
  meetingStatus: MeetingStatus;
  meetingScheduledAt?: string | null;
  adminNotes?: string | null;
  contactedByAdminId?: string | null;
  contactedAt?: string | null;
  activatedTenantId?: string | null;
  ipAddress?: string | null;
  submittedAt: string;
  updatedAt?: string | null;
}

export interface SelectTrialRequest {
  status: 'selected_for_trial' | 'not_selected' | 'rejected';
  adminNotes?: string;
}

export interface ScheduleMeetingRequest {
  meetingScheduledAt: string;
  meetingStatus?: 'scheduled' | 'completed' | 'cancelled';
  adminNotes?: string;
}

export interface ActivateTrialResponse {
  success: boolean;
  prospectId: string;
  tenantId: string;
  companyName: string;
  adminEmail: string;
  planCode: string;
  trialExpiresAt: string;
  initialCredits: number;
  message: string;
}

export interface ProspectAnalyticsResponse {
  totalRegistered: number;
  selectedForTrialCount: number;
  maxTrialQuota: number;
  activatedTrialCount: number;
  scheduledMeetingCount: number;
  breakdownByInterestOption: Record<string, number>;
  breakdownByPlan: Record<string, number>;
  breakdownByIndustry: Record<string, number>;
  breakdownByCompanySize: Record<string, number>;
}






