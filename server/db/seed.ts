import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query, initSchema } from './index.js';

export async function seedDatabase() {
  console.log('[Seed] Checking if database is already seeded...');
  const existingOrgs = await query('SELECT id FROM organizations LIMIT 1');
  if (existingOrgs.rows.length > 0) {
    console.log('[Seed] Database already contains data. Skipping full reseed.');
    return;
  }

  console.log('[Seed] Seeding fresh demo data...');

  const orgId = '11111111-1111-1111-1111-111111111111';
  await query(
    `INSERT INTO organizations (id, name, slug, plan) 
     VALUES ($1, $2, $3, $4)`,
    [orgId, 'Acme Global Innovations', 'acme-global', 'enterprise']
  );

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const users = [
    {
      id: '22222222-2222-2222-2222-222222222221',
      email: 'admin@flowpilot.ai',
      full_name: 'Elena Rostova',
      role: 'Admin',
      department: 'Executive Leadership',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'sarah.manager@flowpilot.ai',
      full_name: 'Sarah Jenkins',
      role: 'Manager',
      department: 'Finance & Operations',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      email: 'alex.employee@flowpilot.ai',
      full_name: 'Alex Rivera',
      role: 'Employee',
      department: 'Product & Engineering',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: '22222222-2222-2222-2222-222222222224',
      email: 'marcus.ops@flowpilot.ai',
      full_name: 'Marcus Vance',
      role: 'Automation Operator',
      department: 'IT & Cloud Operations',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ];

  for (const u of users) {
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, role, organization_id, department, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [u.id, u.email, passwordHash, u.full_name, u.role, orgId, u.department, u.avatar_url]
    );

    await query(
      `INSERT INTO organization_members (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), orgId, u.id, u.role]
    );
  }

  // Hackathon Scenario Problem
  const problemExpenseId = '33333333-3333-3333-3333-333333333331';
  const expenseAIAnalysis = {
    summary:
      'The current manual expense approval process suffers from severe friction, lack of policy enforcement, and 2.5-day latency across 8 handoffs. High automation potential exists for receipt classification, threshold-based auto-routing, and ERP sync.',
    bottlenecks: [
      {
        title: 'Manual Manager Email Inbox Bottleneck',
        description: 'Receipts and requests sit in managers inbox for 36+ hours before initial review.',
        severity: 'high',
      },
      {
        title: 'Manual Finance Spreadsheet Reconciliation',
        description: 'Finance manually cross-checks cost centers in Excel spreadsheets, leading to errors and delays.',
        severity: 'high',
      },
      {
        title: 'Fragmented Employee Status Communication',
        description: 'Employees follow up repeatedly across Slack and email regarding payment timeline.',
        severity: 'medium',
      },
    ],
    manual_tasks: [
      { task: 'Transcribing receipt amounts and line items', automationPotential: 'high' },
      { task: 'Checking department budget threshold rules', automationPotential: 'high' },
      { task: 'Entering verified transactions into ERP accounting system', automationPotential: 'high' },
      { task: 'Sending status update emails to employees', automationPotential: 'high' },
      { task: 'Manager policy exception review for over-budget expenses', automationPotential: 'low' },
    ],
    automation_opportunities: [
      {
        title: 'AI Multi-Tier Routing Engine',
        description: 'Automatically evaluate expense amounts against policy thresholds (< $1,000 auto-assign to Manager; > $1,000 multi-stage Finance Director).',
        expectedImpact: 'Reduces routing delay from 28h to 2 seconds.',
      },
      {
        title: 'Automated ERP Ledger Ingestion',
        description: 'Automatically post approved vouchers into financial accounting ledger.',
        expectedImpact: 'Eliminates 100% of data transcription errors.',
      },
      {
        title: 'Real-Time Notification & Audit Log',
        description: 'Instant notification on approval/rejection with timestamped immutable audit trail.',
        expectedImpact: 'Zero employee inquiry emails.',
      },
    ],
    estimated_time_saved_percent: 68,
    risks: [
      'Inaccurate receipt OCR on crumpled paper invoices',
      'Unauthorized high-value approvals without dual signatures',
    ],
    recommendations: [
      'Implement AI policy validation rule for any expense over $1,000',
      'Require mandatory manager comments for rejected requests',
      'Enable automated Slack notifications to the submitter upon state change',
    ],
    recommended_automation_level: 'high',
  };

  await query(
    `INSERT INTO problems (
      id, organization_id, created_by, title, description, department, 
      current_process, frequency, average_processing_time, people_involved, 
      current_tools, pain_points, estimated_cost, desired_outcome, status, ai_analysis
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      problemExpenseId,
      orgId,
      users[2].id, // Alex Rivera
      'Automated Employee Expense Approval',
      'Employees spend excessive time submitting expense reports while managers and finance spend 2.5 days routing emails and verifying spreadsheets manually.',
      'Finance',
      'Employee -> Email manager -> Manager checks -> Finance receives email -> Finance verifies -> Manual spreadsheet update -> Employee waits',
      'Daily (20-30 requests/day)',
      '2.5 days',
      '4-5 people (Employee, Manager, Finance Analyst, Director)',
      'Outlook Email, Microsoft Excel, Paper Receipts',
      'Sluggish reimbursement turnaround (avg 2.5 days), 8 manual touchpoints, lost receipts, no automatic budget rule checking, lack of auditability.',
      '$8,500 / month in lost operational hours',
      'Turnaround under 4.5 hours, automated rule evaluation, transparent tracking, zero email ping-pong.',
      'WORKFLOW_GENERATED',
      expenseAIAnalysis,
    ]
  );

  // Second Problem: Customer Onboarding
  const problemOnboardingId = '33333333-3333-3333-3333-333333333332';
  await query(
    `INSERT INTO problems (
      id, organization_id, created_by, title, description, department, 
      current_process, frequency, average_processing_time, people_involved, 
      current_tools, pain_points, estimated_cost, desired_outcome, status, ai_analysis
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      problemOnboardingId,
      orgId,
      users[1].id,
      'Client Onboarding & Compliance Verification',
      'New B2B clients require KYC document verification, legal agreement signing, and workspace provisioning across 4 disjointed tools.',
      'Operations',
      'Sales collects PDF via email -> Ops reviews compliance -> Legal verifies contract -> IT creates portal account -> Email sent to customer',
      'Weekly (15 clients/week)',
      '4 business days',
      '3 people (Sales Rep, Ops Lead, IT Admin)',
      'Google Drive, Email, PDF Signer, Internal Admin Portal',
      'Manual document reviews cause delayed onboarding, lost legal signatures, customer dissatisfaction during their first week.',
      '$12,000 / month in delayed revenue recognition',
      'Fully automated compliance triage, under 24 hour client activation, zero manual account provisioning.',
      'ANALYZED',
      {
        summary: 'High manual overhead in compliance verification and multi-system account provisioning.',
        bottlenecks: [
          { title: 'Manual KYC Verification', description: 'Staff verifies IDs manually line by line.', severity: 'high' }
        ],
        manual_tasks: [
          { task: 'Cross referencing company registry', automationPotential: 'high' },
          { task: 'Creating user accounts in DB', automationPotential: 'high' }
        ],
        automation_opportunities: [
          { title: 'Automated Doc Analysis', description: 'Extract company info automatically.', expectedImpact: '75% time reduction' }
        ],
        estimated_time_saved_percent: 72,
        risks: ['Regulatory compliance mismatch on international entities'],
        recommendations: ['Integrate automated document verification API with manual escalation step for flags']
      },
    ]
  );

  // Workflow: Automated Employee Expense Approval
  const workflowExpenseId = '44444444-4444-4444-4444-444444444441';
  await query(
    `INSERT INTO workflows (
      id, organization_id, created_by, problem_id, name, description, 
      category, trigger_type, priority, approval_required, sla_hours, active, version, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      workflowExpenseId,
      orgId,
      users[0].id,
      problemExpenseId,
      'Automated Employee Expense Approval',
      'End-to-end intelligent reimbursement pipeline: AI policy analysis, dynamic threshold routing, manager signoff, and automated ERP ledger update.',
      'Finance',
      'form_submission',
      'high',
      true,
      24,
      true,
      1,
      {
        hackathonDemo: true,
        metricsComparison: {
          processingTime: { before: '2.5 days', after: '4.2 hours' },
          manualSteps: { before: 8, after: 3 },
          automationRate: '85%',
          estimatedTimeSaved: '68%',
        },
      },
    ]
  );

  // Steps for Workflow
  const steps = [
    {
      id: uuidv4(),
      order_index: 1,
      step_type: 'trigger',
      name: 'Expense Submission Received',
      description: 'Triggered when an employee files a reimbursement claim with receipt attachment and details.',
      assignee_role: 'Employee',
      config: { triggerEvent: 'form_submission', formId: 'expense_claim_v1' },
      next_step_order: 2,
    },
    {
      id: uuidv4(),
      order_index: 2,
      step_type: 'ai_decision',
      name: 'AI Policy & Category Routing',
      description: 'Gemini evaluates receipt validity, extracts line items, and classifies expense threshold.',
      assignee_role: 'Automation Operator',
      config: {
        aiModel: 'gemini-2.5-flash',
        promptTemplate: 'Analyze expense amount and determine threshold category (< $1000 vs >= $1000).',
        thresholdRules: [
          { max: 1000, approver: 'Manager' },
          { min: 1000, max: 10000, approver: 'Department Head' },
          { min: 10000, approver: 'Finance + Director' },
        ],
      },
      next_step_order: 3,
    },
    {
      id: uuidv4(),
      order_index: 3,
      step_type: 'approval',
      name: 'Manager Approval Decision',
      description: 'Manager receives notification and approves or rejects the expense claim with comments.',
      assignee_role: 'Manager',
      config: { deadlineHours: 24, escalateIfOverdue: true },
      next_step_order: 4,
    },
    {
      id: uuidv4(),
      order_index: 4,
      step_type: 'task',
      name: 'Finance Verification & Payment Schedule',
      description: 'Finance review team queues automated ACH direct deposit reimbursement.',
      assignee_role: 'Manager',
      config: { autoAssignToDepartment: 'Finance' },
      next_step_order: 5,
    },
    {
      id: uuidv4(),
      order_index: 5,
      step_type: 'data_update',
      name: 'Accounting ERP Ledger Sync',
      description: 'Automatically records transaction voucher into general ledger system.',
      assignee_role: 'Automation Operator',
      config: { targetSystem: 'ERP_NetSuite', action: 'CREATE_EXPENSE_VOUCHER' },
      next_step_order: 6,
    },
    {
      id: uuidv4(),
      order_index: 6,
      step_type: 'notification',
      name: 'Notify Submitter of Reimbursement',
      description: 'Sends real-time confirmation to submitter via Email and Slack with payment date.',
      assignee_role: 'Employee',
      config: { channels: ['email', 'slack', 'app_notification'] },
      next_step_order: 7,
    },
    {
      id: uuidv4(),
      order_index: 7,
      step_type: 'report',
      name: 'AI Execution Audit Summary',
      description: 'FlowPilot AI generates instant performance analysis and logs time saved for the run.',
      assignee_role: 'Automation Operator',
      config: { generatePdf: true, calculateTimeSaved: true },
      next_step_order: 8,
    },
    {
      id: uuidv4(),
      order_index: 8,
      step_type: 'end',
      name: 'Workflow Completed',
      description: 'All steps and checks completed successfully.',
      assignee_role: 'Employee',
      config: {},
      next_step_order: null,
    },
  ];

  for (const s of steps) {
    await query(
      `INSERT INTO workflow_steps (
        id, workflow_id, order_index, step_type, name, description, 
        assignee_role, config, next_step_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [s.id, workflowExpenseId, s.order_index, s.step_type, s.name, s.description, s.assignee_role, s.config, s.next_step_order]
    );
  }

  // Sample Execution 1 (COMPLETED - Demonstrating the After Scenario)
  const exec1Id = '55555555-5555-5555-5555-555555555551';
  await query(
    `INSERT INTO workflow_executions (
      id, workflow_id, organization_id, triggered_by, status, 
      current_step_index, input_data, output_data, started_at, completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      exec1Id,
      workflowExpenseId,
      orgId,
      users[2].id, // Alex Rivera
      'COMPLETED',
      8,
      {
        expense_title: 'Client Strategy Dinner & Travel',
        amount: 420.0,
        currency: 'USD',
        vendor: 'The Capital Grille',
        department: 'Product & Engineering',
        receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      },
      {
        ai_policy_passed: true,
        tier: 'Standard Manager Approval',
        approved_by: 'Sarah Jenkins',
        payout_date: '2026-09-27',
        time_elapsed_hours: 4.2,
      },
      new Date(Date.now() - 3600 * 1000 * 5),
      new Date(Date.now() - 3600 * 1000 * 1),
    ]
  );

  // Step executions for Exec 1
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    await query(
      `INSERT INTO workflow_step_executions (
        id, execution_id, step_id, step_order, step_name, step_type, 
        status, input_data, output_data, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        uuidv4(),
        exec1Id,
        s.id,
        s.order_index,
        s.name,
        s.step_type,
        'COMPLETED',
        { step_input: 'Valid' },
        { status: 'Passed', duration_ms: 1200 },
        new Date(Date.now() - 3600 * 1000 * (5 - i * 0.5)),
        new Date(Date.now() - 3600 * 1000 * (4.5 - i * 0.5)),
      ]
    );
  }

  // Sample Execution 2 (WAITING_APPROVAL - Active for demo interaction!)
  const exec2Id = '55555555-5555-5555-5555-555555555552';
  await query(
    `INSERT INTO workflow_executions (
      id, workflow_id, organization_id, triggered_by, status, 
      current_step_index, input_data, output_data, started_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      exec2Id,
      workflowExpenseId,
      orgId,
      users[2].id,
      'WAITING_APPROVAL',
      3,
      {
        expense_title: 'Annual DevOps & AI Conference Pass + Flights',
        amount: 1850.0,
        currency: 'USD',
        vendor: 'TechSummit Global',
        department: 'Product & Engineering',
        receipt_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
      },
      {
        ai_recommendation: 'Recommend Approval. Expenditure matches annual training & conference budget line item.',
      },
      new Date(Date.now() - 3600 * 1000 * 2),
    ]
  );

  // Active Approval Request
  const approvalId = '66666666-6666-6666-6666-666666666661';
  await query(
    `INSERT INTO approvals (
      id, organization_id, workflow_id, execution_id, approver_user_id, 
      approver_role, status, amount, threshold_applied, deadline, reason
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      approvalId,
      orgId,
      workflowExpenseId,
      exec2Id,
      users[1].id, // Sarah Jenkins (Manager)
      'Manager',
      'PENDING',
      1850.0,
      '$1,000 - $10,000 (Department Head + Manager Signoff Required)',
      new Date(Date.now() + 3600 * 1000 * 22),
      'DevOps Conference pass and roundtrip flights for TechSummit Global in San Francisco.',
    ]
  );

  // Active Task
  await query(
    `INSERT INTO tasks (
      id, organization_id, workflow_id, execution_id, title, description, 
      assigned_to_user_id, assigned_role, priority, status, due_date, comments
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      uuidv4(),
      orgId,
      workflowExpenseId,
      exec1Id,
      'Reconcile general ledger entry for $420 Client Lunch voucher',
      'Verify that accounting voucher ACME-EXP-420-91 is reflected in Q3 general ledger under Marketing/Sales travel.',
      users[1].id,
      'Manager',
      'medium',
      'TODO',
      new Date(Date.now() + 3600 * 1000 * 48),
      [
        {
          user_id: users[0].id,
          user_name: 'Elena Rostova',
          comment: 'System voucher generated automatically. Please verify cost center allocation.',
          created_at: new Date().toISOString(),
        },
      ],
    ]
  );

  // AI Decision Log
  await query(
    `INSERT INTO ai_decisions (
      id, organization_id, workflow_id, execution_id, decision_type, 
      input_context, reasoning, decision_output, confidence_score, latency_ms
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      uuidv4(),
      orgId,
      workflowExpenseId,
      exec2Id,
      'routing_and_threshold_evaluation',
      {
        expense_title: 'Annual DevOps & AI Conference Pass + Flights',
        amount: 1850.0,
        department: 'Product & Engineering',
      },
      'Expense amount ($1,850.00) exceeds standard $1,000 single-manager threshold. AI policy engine routes to Sarah Jenkins (Department Manager) with escalated priority flag for finance visibility.',
      {
        priority: 'high',
        assigned_role: 'Manager',
        escalationRequired: false,
        recommendedAction: 'Approve with cost-center verification',
      },
      0.97,
      340,
    ]
  );

  // Notification for Sarah Jenkins
  await query(
    `INSERT INTO notifications (
      id, organization_id, user_id, type, title, message, link, read
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      uuidv4(),
      orgId,
      users[1].id,
      'approval_requested',
      'New Expense Approval Required: $1,850.00',
      'Alex Rivera submitted an expense request for "Annual DevOps & AI Conference Pass + Flights". Immediate review required.',
      '/approvals',
      false,
    ]
  );

  // Audit Log
  await query(
    `INSERT INTO audit_logs (
      id, organization_id, user_id, action, entity_type, entity_id, details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      uuidv4(),
      orgId,
      users[2].id,
      'workflow_execute',
      'workflow',
      workflowExpenseId,
      { execution_id: exec2Id, amount: 1850.0, trigger: 'form_submission' },
    ]
  );

  // Sample AI Performance Report
  await query(
    `INSERT INTO reports (
      id, organization_id, created_by, title, report_type, summary, 
      metrics, ai_insights, recommendations, raw_content
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      uuidv4(),
      orgId,
      users[0].id,
      'Monthly Operational Efficiency & Automation Audit',
      'execution_summary',
      'Across 124 executed workflows in the last 30 days, FlowPilot AI reduced average processing time from 2.5 days to 4.2 hours, achieving an 85% overall automation rate and $24,800 estimated operational cost savings.',
      {
        totalExecutions: 124,
        successRate: 98.4,
        avgProcessingTimeHours: 4.2,
        estimatedHoursSaved: 380,
        costSavingsEstimated: '$24,800',
        automationRate: 85,
      },
      [
        'Employee reimbursement requests now clear 14x faster with automated OCR and routing.',
        'Human intervention is now required on only 15% of transactions (those over $1,000 or policy anomalies).',
        'Finance reconciliation errors dropped from 6.8% to 0.2%.',
      ],
      [
        'Increase auto-approval threshold from $250 to $500 for recurring SaaS subscriptions with verified vendor domains.',
        'Enable automated Slack notifications to submitters upon manager decision.',
        'Connect automated webhook to bank ACH gateway for instant same-day payout.',
      ],
      'Detailed audit breakdown of Acme Global Innovations operational workflows...',
    ]
  );

  console.log('[Seed] Database seeded successfully with demo scenario data!');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
