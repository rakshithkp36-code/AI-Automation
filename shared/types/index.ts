export type UserRole = 'Admin' | 'Manager' | 'Employee' | 'Automation Operator';

export type ProblemStatus = 'DRAFT' | 'ANALYZED' | 'WORKFLOW_GENERATED' | 'RESOLVED';

export type WorkflowTriggerType = 'manual' | 'form_submission' | 'schedule' | 'event' | 'webhook';

export type StepType =
  | 'trigger'
  | 'task'
  | 'approval'
  | 'ai_decision'
  | 'condition'
  | 'notification'
  | 'data_update'
  | 'report'
  | 'end';

export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'WAITING_TASK'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type StepExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_INPUT'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  avatar_url?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: string;
  organization_id: string;
  created_by: string;
  creator_name?: string;
  title: string;
  description: string;
  department: string;
  current_process: string;
  frequency: string;
  average_processing_time: string;
  people_involved: string;
  current_tools: string;
  pain_points: string;
  estimated_cost: string;
  desired_outcome: string;
  status: ProblemStatus;
  ai_analysis?: AIProblemAnalysis;
  created_at: string;
  updated_at: string;
}

export interface AIProblemAnalysis {
  summary: string;
  bottlenecks: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  manual_tasks: Array<{
    task: string;
    automationPotential: 'low' | 'medium' | 'high';
  }>;
  automation_opportunities: Array<{
    title: string;
    description: string;
    expectedImpact: string;
  }>;
  estimated_time_saved_percent: number;
  risks: string[];
  recommendations: string[];
  recommended_automation_level?: 'low' | 'medium' | 'high' | 'autonomous';
}

export interface WorkflowStep {
  id: string;
  workflow_id?: string;
  order_index: number;
  step_type: StepType;
  name: string;
  description: string;
  assignee_role?: string;
  config: Record<string, any>;
  next_step_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Workflow {
  id: string;
  organization_id: string;
  created_by: string;
  creator_name?: string;
  problem_id?: string | null;
  name: string;
  description: string;
  category: string;
  trigger_type: WorkflowTriggerType;
  priority: PriorityLevel;
  approval_required: boolean;
  sla_hours: number;
  active: boolean;
  version: number;
  metadata?: Record<string, any>;
  steps?: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name?: string;
  organization_id: string;
  triggered_by: string;
  triggerer_name?: string;
  status: ExecutionStatus;
  current_step_index: number;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  started_at: string;
  completed_at?: string | null;
  error_details?: Record<string, any> | null;
  step_executions?: WorkflowStepExecution[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepExecution {
  id: string;
  execution_id: string;
  step_id?: string;
  step_order: number;
  step_name: string;
  step_type: StepType;
  status: StepExecutionStatus;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  started_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  workflow_id?: string;
  workflow_name?: string;
  execution_id?: string;
  step_execution_id?: string;
  title: string;
  description: string;
  assigned_to_user_id?: string | null;
  assigned_to_name?: string | null;
  assigned_role: string;
  priority: PriorityLevel;
  status: TaskStatus;
  due_date?: string | null;
  comments: Array<{
    user_id: string;
    user_name: string;
    comment: string;
    created_at: string;
  }>;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  organization_id: string;
  workflow_id?: string;
  workflow_name?: string;
  execution_id?: string;
  step_execution_id?: string;
  approver_user_id?: string | null;
  approver_name?: string | null;
  approver_role: string;
  status: ApprovalStatus;
  amount?: number | null;
  threshold_applied?: string | null;
  deadline?: string | null;
  reason?: string | null;
  comments?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  history?: Array<{
    action: string;
    user: string;
    timestamp: string;
    comments?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AIDecision {
  id: string;
  organization_id: string;
  workflow_id?: string;
  execution_id?: string;
  step_id?: string;
  decision_type: string;
  input_context: Record<string, any>;
  reasoning: string;
  decision_output: Record<string, any>;
  confidence_score: number;
  latency_ms: number;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Report {
  id: string;
  organization_id: string;
  created_by: string;
  creator_name?: string;
  title: string;
  report_type: 'execution_summary' | 'performance_audit' | 'bottleneck_analysis' | 'optimization';
  summary: string;
  metrics: Record<string, any>;
  ai_insights: string[];
  recommendations: string[];
  raw_content?: string;
  created_at: string;
}
