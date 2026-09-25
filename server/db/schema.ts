// FlowPilot AI PostgreSQL Schema Definition
export const SCHEMA_SQL = `
SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Employee',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  avatar_url TEXT,
  department VARCHAR(100) DEFAULT 'Operations',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department VARCHAR(100) NOT NULL,
  current_process TEXT NOT NULL,
  frequency VARCHAR(100) DEFAULT 'Daily',
  average_processing_time VARCHAR(100) DEFAULT '2 hours',
  people_involved VARCHAR(100) DEFAULT '2-3 people',
  current_tools VARCHAR(255) DEFAULT 'Email, Spreadsheets',
  pain_points TEXT NOT NULL,
  estimated_cost VARCHAR(100) DEFAULT '$5,000 / month',
  desired_outcome TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT',
  ai_analysis JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_problems_org ON problems(organization_id);

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Operations',
  trigger_type VARCHAR(50) DEFAULT 'manual',
  priority VARCHAR(50) DEFAULT 'medium',
  approval_required BOOLEAN DEFAULT FALSE,
  sla_hours INT DEFAULT 24,
  active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflows_org ON workflows(organization_id);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  step_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  assignee_role VARCHAR(100) DEFAULT 'Employee',
  config JSONB DEFAULT '{}',
  next_step_order INT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_steps_workflow ON workflow_steps(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  triggered_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  current_step_index INT DEFAULT 0,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  error_details JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_executions_org ON workflow_executions(organization_id);
CREATE INDEX IF NOT EXISTS idx_executions_wf ON workflow_executions(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_step_executions (
  id UUID PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
  step_order INT NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_step_exec_exec ON workflow_step_executions(execution_id);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
  step_execution_id UUID REFERENCES workflow_step_executions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_role VARCHAR(100) DEFAULT 'Employee',
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'TODO',
  due_date TIMESTAMPTZ DEFAULT NULL,
  comments JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_user_id);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
  step_execution_id UUID REFERENCES workflow_step_executions(id) ON DELETE SET NULL,
  approver_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approver_role VARCHAR(100) DEFAULT 'Manager',
  status VARCHAR(50) DEFAULT 'PENDING',
  amount NUMERIC DEFAULT NULL,
  threshold_applied VARCHAR(255) DEFAULT NULL,
  deadline TIMESTAMPTZ DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  comments TEXT DEFAULT NULL,
  approved_at TIMESTAMPTZ DEFAULT NULL,
  rejected_at TIMESTAMPTZ DEFAULT NULL,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approvals_org ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
  run_type VARCHAR(50) DEFAULT 'automated_step',
  status VARCHAR(50) DEFAULT 'success',
  duration_ms INT DEFAULT 0,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_decisions (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE SET NULL,
  step_id UUID DEFAULT NULL,
  decision_type VARCHAR(100) NOT NULL,
  input_context JSONB DEFAULT '{}',
  reasoning TEXT NOT NULL,
  decision_output JSONB DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0.95,
  latency_ms INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_org ON ai_decisions(organization_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) DEFAULT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  metrics JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  raw_content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(organization_id);
`;
