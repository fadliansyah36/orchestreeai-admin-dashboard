// OrchestreeAI Super Admin Platform Types & Data Contracts

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | string;

export interface AdminUserProfile {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | string;
  tenantId: string;
  isMfaVerified: boolean;
  fullName: string;
}

export interface AdminAuthResponse {
  token?: string;
  accessToken?: string;
  role?: string;
  isMfaVerified?: boolean;
  user?: AdminUserProfile;
  mfaRequired?: boolean;
  challengeToken?: string;
  message?: string;
  expiresInSeconds?: number;
  csrfToken?: string;
}

export interface TenantItem {
  id: string;
  name: string;
  tier: string;
  ownerEmail?: string;
  status?: string;
  createdAt?: number | string;
  agentCount?: number;
  userCount?: number;
}

export interface LlmProviderItem {
  id: string;
  name: string;
  providerType: string;
  baseUrl?: string;
  enabled: boolean;
  taskSpecialization?: string;
  fallbackPriority?: number;
  apiKey?: string;
  models?: string[];
  latencyMs?: number;
  status?: string;
}

export interface LlmProviderModelItem {
  id: string;
  modelId: string;
  modelName: string;
  providerId: string;
  contextWindow?: number;
  inputCostPerMillion?: number;
  outputCostPerMillion?: number;
  isDefault?: boolean;
  capabilities?: string[];
}

export interface ImageProviderItem {
  id: string;
  name: string;
  providerType: string;
  models: string[];
  priority: number;
  apiKey?: string;
  status?: string;
}

export interface McpToolItem {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  requiredRole: string;
  restrictedToOperationMode?: string;
  inputSchema?: string;
  isEnabled?: boolean;
  killSwitchActive?: boolean;
  totalInvocations?: number;
}

export interface AppRegistryItem {
  id: string;
  appName: string;
  appType: string;
  clientId: string;
  scopes: string[];
  status?: string;
  capabilityStatus?: string;
  manualLinkMigrationNotice?: string;
  authType?: string;
  isConnected?: boolean;
  iconUrl?: string;
}

export interface MasterDataItem {
  id: string;
  category: string;
  key: string;
  value: string;
  description?: string;
  updatedAt?: number | string;
}

export interface MasterDataCategoryInfo {
  category: string;
  count: number;
  description?: string;
}

export interface SkillPluginItem {
  id: string;
  name: string;
  version: string;
  author: string;
  executionRuntime: string;
  status: string;
  description?: string;
  installedAt?: number | string;
}

export interface SkillPluginUploadResult {
  success: boolean;
  pluginId: string;
  manifestSummary?: any;
}

export interface WorkforceMonitoringSummary {
  totalDepartments: number;
  totalJobTitles: number;
  totalAiAgents: number;
  totalHumanWorkers: number;
  humanToAiRatio: number;
  departmentBreakdown: Array<{
    department: string;
    humanCount: number;
    aiCount: number;
    activeTasks: number;
    completionRate: number;
  }>;
  jobTitles: Array<{
    title: string;
    department: string;
    agentCount: number;
    status: string;
    avgConfidenceScore: number;
  }>;
}

export interface WorkforceOverviewResponse {
  totalAiEmployees: number;
  totalHumanSupervisors: number;
  activeTasksCount: number;
  monthlySuccessRate: number;
  aiEmployees?: Array<{
    id: string;
    name: string;
    role: string;
    currentStatus: string;
    autonomyLevel: string;
    tasksCompleted: number;
  }>;
}

export interface SystemMonitoringOverview {
  clusterHealth: string;
  totalPods: number;
  activePods: number;
  failedPods: number;
  kubernetesDeployments: Array<{
    name: string;
    replicas: number;
    available: number;
    status: string;
  }>;
  circuitBreakers: Array<{
    provider: string;
    status: 'CLOSED' | 'HALF_OPEN' | 'OPEN' | string;
    failureRate: number;
    latencyMs: number;
  }>;
  dlqCount: number;
  securityGatesPassed: boolean;
}

export interface SystemHealthResponse {
  status: string;
  version?: string;
  uptimeSeconds?: number;
  avgLatencyMs?: number;
  providers?: any[];
}

export interface CircuitBreakerItem {
  serviceName: string;
  failureCount: number;
  state: 'CLOSED' | 'HALF_OPEN' | 'OPEN' | string;
  lastStateChange: number | string;
}

export interface AuditLogItem {
  id: string;
  timestamp: number | string;
  operatorId: string;
  role: string;
  action: string;
  resource: string;
  tenantId?: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | string;
  ipAddress: string;
  details?: string;
}

export interface UsageAnalytics {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  totalCostUsd: number;
  costSavingsPercentage: number;
  tokensByProvider: Record<string, number>;
  costByProvider: Record<string, number>;
  breakdown: any[];
  historicalTrend: Array<{
    date: string;
    tokens: number;
    cost: number;
  }>;
}

export interface DeadLetterRecord {
  id: string;
  workflowId: string;
  executionId: string;
  nodeId: string;
  tenantId: string;
  errorType: string;
  errorMessage: string;
  payload: string;
  status: string;
  createdAt: number | string;
  retryCount: number;
  reprocessedAt?: number | string;
  reprocessed: boolean;
  jobType: string;
  failureReason: string;
  originalPayload: string;
  failedAt: number | string;
  reprocessResult: string;
}

export interface WorkflowExecutionSummary {
  id: string;
  executionId: string;
  workflowName: string;
  workflowDefId: string;
  tenantId: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING' | 'PENDING' | string;
  executionStatus: string;
  startTime: number | string;
  executedAt: number | string;
  durationMs: number;
  nodeCount: number;
  lastCompletedNodeId: string;
  triggerType: string;
}

export interface WorkflowReplayResult {
  executionId: string;
  originalExecutionId: string;
  replayExecutionId: string;
  isDeterministicMatch: boolean;
  status: string;
  durationMs: number;
  sandboxDetails: any;
  originalOutput: any;
  replayOutput: any;
  nodeRuns: any[];
  replayNodes: Array<{
    nodeId: string;
    status: string;
    outputPreview?: string;
  }>;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  activeTenants: number;
  totalWorkforce: number;
  platformGrossMargin: number;
  total_transaction_value: number;
  total_transactions: number;
  total_revenue_this_month: number;
  total_repeat_orders: number;
  total_tenants_active: number;
  total_staff_human: number;
  total_ai_agents_active: number;
  revenueTrend: Array<{
    label: string;
    revenue: number;
    creditConsumed: number;
  }>;
}

export interface TenantUsageCreditItem {
  id: string;
  name: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  creditsAllocated: number;
  creditsUsed: number;
  creditsRemaining: number;
  balance: number;
  total_usage_this_month: number;
  burnRatePerDay: number;
  status: string;
}

export interface LlmUsagePlatformWide {
  totalCalls: number;
  avgLatencyMs: number;
  total_cost_usd: number;
  breakdown_by_provider: any[];
  providerBreakdown: Array<{
    provider: string;
    callCount: number;
    tokenCount: number;
    errorRate: number;
    cost: number;
  }>;
}

export interface KpiSummary {
  mrr: number;
  arr: number;
  totalCreditsCirculating: number;
  totalCreditsConsumed: number;
  totalActiveSubscriptions: number;
  netRetentionRate: number;
  human_distribution?: any;
  ai_agent_distribution?: any;
  platform_average_score: number;
}

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

export interface ReconciliationOrderDto {
  id: string;
  orderNumber: string;
  tenantId: string;
  tenantName?: string;
  customerId: string;
  amount: number;
  status: 'paid' | 'pending_payment' | 'failed' | 'expired' | string;
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
  gatewayReportedStatus: string;
  localStatus: string;
  resolutionStatus: 'pending_review' | 'resolved' | 'rejected' | string;
  createdAt: number;
  orderAmount: number;
  gatewayAmount: number;
  resolvedBySuperAdminId?: string;
  resolvedBy?: string;
  resolutionReason?: string;
  resolvedAt?: number;
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

export interface PresenceSecurityAuditSummary {
  totalEnrolledUsers: number;
  totalVerificationChecks: number;
  totalSuccessfulChecks: number;
  totalFailedChecks: number;
  consecutiveFailures: number;
  potentialUnauthorizedAttempts: number;
  methodBreakdown: {
    face: number;
    fingerprint: number;
    passwordFallback: number;
  };
  securityRiskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | string;
}

export interface UniversalSelectionUsageResponse {
  totalSelections: number;
  total_requests: number;
  total_completed_requests: number;
  total_processing_requests: number;
  total_failed_requests: number;
  total_credits_consumed: number;
  most_used_domain_category: string;
  domain_categories: any[];
  tenants_usage: any[];
  privacy_notice: string;
  modelDistribution: Record<string, number>;
  successRate: number;
  avgSelectionConfidence: number;
  rankedCandidates: Array<{
    modelName: string;
    taskType: string;
    score: number;
    winRate: number;
  }>;
}

export interface CommercialPlanItem {
  id: string;
  planCode: string;
  planName: string;
  billingInterval: string;
  price: number | null;
  currency: string;
  creditAllocation: number;
  humanSeatLimit: number;
  aiAgentLimit: number;
  isPriceVisible: boolean;
  isActive: boolean;
  sortOrder: number;
  description?: string;
  badge?: string;
  features?: string[];
  updatedAt?: string;
}

export interface CommercialPlanUpsertRequest {
  id?: string;
  planCode: string;
  planName: string;
  billingInterval: string;
  price: number | null;
  currency: string;
  creditAllocation: number;
  humanSeatLimit: number;
  aiAgentLimit: number;
  isPriceVisible: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface PlanFeatureEntitlementsMatrix {
  planCodes: string[];
  featureKeys: string[];
  matrix: Record<string, Record<string, string>>;
}

export interface EntitlementUpdateRequest {
  planCode: string;
  featureKey?: string;
  featureValue?: string;
  value?: string;
  featureCode?: string;
  isEnabled?: boolean;
}

export interface TenantCustomOverrideResponse {
  tenantId: string;
  overrideJson: string;
  customEntitlementOverride?: any;
  hasCustomOverrides: boolean;
  updatedAt?: string;
}

export interface CreditMeteringRuleItem {
  id?: string;
  activityType: string;
  baseWorkUnits?: number;
  baseCreditCost?: number;
  description?: string;
  isActive?: boolean;
}

export interface CreditCostFactorItem {
  id?: string;
  factorType: string;
  factorKey: string;
  multiplier: number;
  description?: string;
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
  breakdown: {
    base: number;
    complexity: number;
    model: number;
    tool: number;
    execution: number;
  };
}

export interface ManualCreditAdjustmentRequest {
  tenantId: string;
  amount: number;
  ledgerType: string;
  reason: string;
  operatorId: string;
}

export interface ManualCreditAdjustmentResponse {
  success: boolean;
  tenantId: string;
  newBalance: number;
  newAvailableBalance: number;
  ledgerId: string;
}

export interface AiCreditLedgerItem {
  id: string;
  tenantId: string;
  amount: number;
  ledgerType: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: number | string;
}

export interface TenantWalletDetailsResponse {
  tenantId: string;
  subscriptionBalance: number;
  topupBalance: number;
  bonusBalance: number;
  reservedBalance: number;
  usedBalance: number;
  availableBalance: number;
  wallet?: any;
  entries: any[];
  totalLedger: number;
  ledgerHistory?: AiCreditLedgerItem[];
}

export interface FinancialCommandCenterResponse {
  kpis: {
    mrr: number;
    arr: number;
    activeSubscriptionsCount: number;
    totalCreditsCirculating: number;
    totalCreditsConsumed: number;
    totalRevenueIdr: number;
    estimatedComputeCostIdr: number;
    netMarginPercentage: number;
  };
  planDistribution: Array<{
    planCode: string;
    planName: string;
    count: number;
    percentage: number;
  }>;
  topTenantsByConsumption: Array<{
    tenantId: string;
    tenantName: string;
    planCode: string;
    creditsConsumed: number;
    percentageOfTotal: number;
  }>;
  recentTopUpsTotal: number;
  timestamp: string;
}

export interface IndustryCatalogItem {
  id: string;
  code: string;
  name: string;
  industry_name?: string;
  description?: string;
  recommendedPlanCode?: string;
}

export type InterestOptionType =
  | 'direct_trial_or_subscription'
  | 'demo_request'
  | 'enterprise_discussion'
  | 'schedule_meeting_presentation'
  | 'custom_contact'
  | string;

export interface ProspectRegistrationRequest {
  fullName: string;
  email: string;
  companyName: string;
  jobTitle?: string;
  industryCategoryId?: string;
  industryId?: string;
  companySizeRange?: string;
  planId?: string;
  interestedPlanId?: string;
  interestOption?: InterestOptionType;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
  teamSize?: string;
  message?: string;
}

export interface ProspectRegistrationItem {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  industryName?: string;
  planName?: string;
  interestOption: string;
  trialStatus: string;
  meetingStatus: string;
  createdAt: string;
  scheduledMeetingDate?: string;
  trialCreditsAllocated?: number;
}

export interface SelectTrialRequest {
  trialStatus: string;
  trialNotes?: string;
}

export interface ScheduleMeetingRequest {
  scheduledDate: string;
  meetingLink?: string;
  notes?: string;
}

export interface ActivateTrialResponse {
  success: boolean;
  tenantId: string;
  initialCredits: number;
  trialExpiresAt: string;
}

export interface ProspectAnalyticsResponse {
  totalLeads: number;
  trialSlotsOccupied: number;
  maxTrialSlots: number;
  directSubscriptions: number;
  scheduledDemos: number;
  conversionRate: number;
}

// Fase 124 Security & Impersonation Types
export interface SupportImpersonationSession {
  sessionId: string;
  operatorId: string;
  targetTenantId: string;
  tenantName: string;
  ownerEmail: string;
  reason: string;
  token: string;
  startedAt: number;
  expiresAt: number;
  durationMinutes: number;
  notificationSent: boolean;
}

export interface IpAllowlistConfig {
  enabled: boolean;
  allowedIps: string[];
  updatedAt?: string;
  updatedBy?: string;
}

