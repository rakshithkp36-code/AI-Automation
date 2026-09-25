import { z } from 'zod';

export const UserRoleSchema = z.enum(['Admin', 'Manager', 'Employee', 'Automation Operator']);

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  role: UserRoleSchema.default('Employee'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const CreateProblemSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 chars)'),
  description: z.string().min(10, 'Description is required (min 10 chars)'),
  department: z.string().min(2, 'Department is required'),
  currentProcess: z.string().min(10, 'Current process description is required'),
  frequency: z.string().default('Daily'),
  averageProcessingTime: z.string().default('2 hours'),
  peopleInvolved: z.string().default('2-3 people'),
  currentTools: z.string().default('Email, Excel'),
  painPoints: z.string().min(5, 'Pain points are required'),
  estimatedCost: z.string().default('$5,000 / month'),
  desiredOutcome: z.string().min(5, 'Desired outcome is required'),
});

export const StepTypeSchema = z.enum([
  'trigger',
  'task',
  'approval',
  'ai_decision',
  'condition',
  'notification',
  'data_update',
  'report',
  'end',
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const WorkflowStepSchema = z.object({
  id: z.string().optional(),
  order_index: z.number().int().nonnegative(),
  step_type: StepTypeSchema,
  name: z.string().min(2),
  description: z.string().default(''),
  assignee_role: z.string().optional().default('Employee'),
  config: z.record(z.any()).default({}),
  next_step_order: z.number().nullable().optional(),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(3, 'Workflow name is required'),
  description: z.string().default(''),
  category: z.string().default('Operations'),
  trigger_type: z.enum(['manual', 'form_submission', 'schedule', 'event', 'webhook']).default('manual'),
  priority: PrioritySchema.default('medium'),
  approval_required: z.boolean().default(false),
  sla_hours: z.number().positive().default(24),
  active: z.boolean().default(true),
  problem_id: z.string().uuid().nullable().optional(),
  steps: z.array(WorkflowStepSchema).min(1, 'At least one step is required'),
  metadata: z.record(z.any()).optional().default({}),
});

export const ExecuteWorkflowSchema = z.object({
  input_data: z.record(z.any()).default({}),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().default(''),
  priority: PrioritySchema.default('medium'),
  assigned_to_user_id: z.string().uuid().nullable().optional(),
  assigned_role: z.string().default('Employee'),
  due_date: z.string().nullable().optional(),
  workflow_id: z.string().uuid().nullable().optional(),
  execution_id: z.string().uuid().nullable().optional(),
});

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED']),
  comment: z.string().optional(),
});

export const ApprovalDecisionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

// AI JSON Output Schemas
export const AIProblemAnalysisSchema = z.object({
  summary: z.string(),
  bottlenecks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
    })
  ),
  manual_tasks: z.array(
    z.object({
      task: z.string(),
      automationPotential: z.enum(['low', 'medium', 'high']),
    })
  ),
  automation_opportunities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
    })
  ),
  estimated_time_saved_percent: z.number().min(0).max(100),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
  recommended_automation_level: z.enum(['low', 'medium', 'high', 'autonomous']).optional(),
});

export const AIWorkflowStepSchema = z.object({
  order: z.number().int().positive(),
  type: StepTypeSchema,
  name: z.string(),
  description: z.string(),
  assigneeRole: z.string().default('Employee'),
  conditions: z.array(z.any()).default([]),
  nextStep: z.number().int().nullable().optional(),
});

export const AIWorkflowSchema = z.object({
  workflowName: z.string(),
  description: z.string(),
  category: z.string().default('Operations'),
  trigger: z.object({
    type: z.enum(['manual', 'form_submission', 'schedule', 'event', 'webhook']),
    description: z.string().optional(),
  }),
  steps: z.array(AIWorkflowStepSchema).min(1),
  completionCriteria: z.array(z.string()).default([]),
  exceptionHandling: z.array(z.string()).default([]),
});

export const AIRoutingSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  department: z.string(),
  recommendedAssigneeRole: z.string(),
  approvalRequired: z.boolean(),
  escalationRequired: z.boolean().default(false),
  reasoning: z.string(),
});

export const AIPerformanceAnalysisSchema = z.object({
  summary: z.string(),
  bottlenecks: z.array(z.string()),
  inefficiencies: z.array(z.string()),
  recommendations: z.array(z.string()),
  estimatedImprovementPercent: z.number(),
});

export const AIReportSchema = z.object({
  title: z.string(),
  summary: z.string(),
  reportType: z.enum(['execution_summary', 'performance_audit', 'bottleneck_analysis', 'optimization']),
  metrics: z.object({
    totalExecutions: z.number().default(0),
    successRate: z.number().default(0),
    avgProcessingTimeHours: z.number().default(0),
    estimatedHoursSaved: z.number().default(0),
    costSavingsEstimated: z.string().default('$0'),
  }),
  keyFindings: z.array(z.string()),
  bottlenecks: z.array(z.string()),
  recommendations: z.array(z.string()),
});
