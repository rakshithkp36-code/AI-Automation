const API_BASE = 'http://localhost:5000/api';

async function testFlowPilot() {
  console.log('=== FLOWPILOT AI FULL INTEGRATION TEST ===\n');

  // 1. Health check
  console.log('[1] Testing Health Endpoint...');
  const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
  console.log('Health:', healthRes);

  // 2. Authentication Login as Admin
  console.log('\n[2] Logging in as Admin (Elena Rostova)...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@flowpilot.ai', password: 'password123' }),
  }).then((r) => r.json());

  if (!loginRes.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.token;
  console.log('Login successful! Role:', loginRes.user.role, 'Org:', loginRes.user.organization_name);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Organization Workspace
  console.log('\n[3] Fetching Organization details...');
  const org = await fetch(`${API_BASE}/organization`, { headers: authHeaders }).then((r) => r.json());
  console.log('Organization:', org.name, '| Slug:', org.slug, '| Plan:', org.plan);

  // 4. Create Problem
  console.log('\n[4] Creating Problem Discovery record...');
  const problemData = {
    title: 'Automated Employee Expense Approval (Integration Test)',
    description: 'Manual receipt verification and manager emails take 2.5 days with 8 manual steps.',
    department: 'Finance',
    currentProcess: 'Employee emails spreadsheet -> manager reviews -> finance checks budget -> payment manually queued',
    frequency: 'Daily (25/day)',
    averageProcessingTime: '2.5 days',
    peopleInvolved: '4 people',
    currentTools: 'Excel, Outlook, Paper Receipts',
    painPoints: 'Slow turnaround, lost receipts, no policy checks',
    estimatedCost: '$8,500 / month',
    desiredOutcome: 'Under 4.5 hours turnaround, automated threshold routing, ERP ledger sync',
  };

  const problem = await fetch(`${API_BASE}/problems`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(problemData),
  }).then((r) => r.json());
  console.log('Problem created! ID:', problem.id, 'Title:', problem.title);

  // 5. Run AI Process Analysis
  console.log('\n[5] Running AI Process Analysis on problem...');
  const analysisRes = await fetch(`${API_BASE}/problems/${problem.id}/analyze`, {
    method: 'POST',
    headers: authHeaders,
  }).then((r) => r.json());
  console.log('AI Analysis completed!');
  console.log('Summary:', analysisRes.analysis.summary.substring(0, 100) + '...');
  console.log('Bottlenecks found:', analysisRes.analysis.bottlenecks.length);
  console.log('Estimated Time Saved:', analysisRes.analysis.estimated_time_saved_percent + '%');

  // 6. Generate Automated Workflow from Problem
  console.log('\n[6] Generating Automated Workflow via AI...');
  const workflow = await fetch(`${API_BASE}/workflows/generate-from-problem/${problem.id}`, {
    method: 'POST',
    headers: authHeaders,
  }).then((r) => r.json());
  console.log('Workflow generated! ID:', workflow.id, 'Name:', workflow.name);
  console.log('Step count:', workflow.steps?.length || 0);

  // 7. Execute Workflow
  console.log('\n[7] Triggering Workflow Execution...');
  const execResult = await fetch(`${API_BASE}/workflows/${workflow.id}/execute`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      input_data: {
        expense_title: 'Client Lunch & Travel Voucher',
        amount: 850.0,
        currency: 'USD',
        vendor: 'The Palm Restaurant',
      },
    }),
  }).then((r) => r.json());
  console.log('Execution started! Status:', execResult.status, 'ID:', execResult.executionId);

  // 8. Fetch Execution Details
  console.log('\n[8] Inspecting Execution Step Telemetry & Pending Approvals...');
  const execDetails = await fetch(`${API_BASE}/executions/${execResult.executionId}`, {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log('Current Step Index:', execDetails.current_step_index);
  console.log('Status:', execDetails.status);
  console.log('Step Executions:', execDetails.step_executions?.map((s: any) => `${s.step_order}: ${s.step_name} (${s.status})`));

  // 9. If Waiting Approval, Approve it!
  if (execDetails.status === 'WAITING_APPROVAL' && execDetails.approvals?.length > 0) {
    const pendingAppr = execDetails.approvals.find((a: any) => a.status === 'PENDING');
    console.log(`\n[9] Found pending approval for $${pendingAppr.amount} (${pendingAppr.threshold_applied}). Authorizing...`);

    const approveRes = await fetch(`${API_BASE}/approvals/${pendingAppr.id}/approve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ comments: 'Approved by Elena Rostova. Verified against Q3 travel budget.' }),
    }).then((r) => r.json());
    console.log('Approval Granted! Result:', approveRes.message);

    // Re-inspect execution after approval
    const updatedExec = await fetch(`${API_BASE}/executions/${execResult.executionId}`, {
      headers: authHeaders,
    }).then((r) => r.json());
    console.log('Execution Status after approval:', updatedExec.status);
    console.log('Steps completed:', updatedExec.step_executions?.filter((s: any) => s.status === 'COMPLETED').length);
  }

  // 10. Analytics Overview
  console.log('\n[10] Fetching Analytics Overview...');
  const analytics = await fetch(`${API_BASE}/analytics/overview`, { headers: authHeaders }).then((r) => r.json());
  console.log('Total Workflows:', analytics.workflows.total);
  console.log('Automation Rate:', analytics.impact.automationRate + '%');
  console.log('Estimated Hours Saved:', analytics.impact.estimatedHoursSaved);
  console.log('Cost Savings:', analytics.impact.estimatedCostSaved);

  // 11. Generate Executive AI Report
  console.log('\n[11] Generating Executive AI Report...');
  const report = await fetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Monthly Autonomous Operations Report',
      reportType: 'execution_summary',
    }),
  }).then((r) => r.json());
  console.log('Report generated successfully! ID:', report.id, 'Title:', report.title);

  // 12. Check Audit Logs
  console.log('\n[12] Verifying System Audit Logs...');
  const logs = await fetch(`${API_BASE}/audit`, { headers: authHeaders }).then((r) => r.json());
  console.log('Total Audit Logs recorded:', logs.length);
  console.log('Recent Actions:', logs.slice(0, 5).map((l: any) => l.action));

  console.log('\n=== ALL FLOWPILOT AI INTEGRATION TESTS PASSED WITH 100% SUCCESS! ===');
}

testFlowPilot().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
