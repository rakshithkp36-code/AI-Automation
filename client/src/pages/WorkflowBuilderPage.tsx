import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  Handle,
  Position,
  Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Database,
  Bell,
  FileCheck,
  Zap,
  Sparkles,
  Settings,
  X,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

// Custom Workflow Node Component for React Flow
const StepCustomNode = ({ data, selected }: any) => {
  const stepIcons: Record<string, any> = {
    trigger: Play,
    ai_decision: Cpu,
    approval: ShieldCheck,
    task: CheckCircle2,
    data_update: Database,
    notification: Bell,
    report: FileCheck,
    end: CheckCircle2,
    condition: Zap,
  };

  const borderColors: Record<string, string> = {
    trigger: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300',
    ai_decision: 'border-purple-500/80 bg-purple-950/50 text-purple-300 shadow-lg shadow-purple-500/20',
    approval: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
    task: 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300',
    data_update: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300',
    notification: 'border-teal-500/60 bg-teal-950/40 text-teal-300',
    report: 'border-violet-500/60 bg-violet-950/40 text-violet-300',
    end: 'border-slate-500/60 bg-slate-900/50 text-slate-300',
    condition: 'border-yellow-500/60 bg-yellow-950/40 text-yellow-300',
  };

  const Icon = stepIcons[data.step_type] || CheckCircle2;
  const colorClass = borderColors[data.step_type] || 'border-surface-300 bg-surface-200 text-slate-200';

  return (
    <div
      className={`min-w-[220px] max-w-[280px] p-3 rounded-xl border backdrop-blur-md transition-all shadow-xl ${colorClass} ${
        selected ? 'ring-2 ring-white scale-105' : 'hover:scale-[1.02]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-slate-400" />

      <div className="flex items-center justify-between mb-1.5">
        <span className="w-5 h-5 rounded-md bg-surface-300/80 text-[10px] font-bold flex items-center justify-center text-slate-200">
          {data.order_index}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-surface-300/60">
          {data.step_type}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <h4 className="text-xs font-bold text-white truncate">{data.name}</h4>
      </div>

      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
        {data.description || 'Step execution node'}
      </p>

      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
        <span>Role: <strong className="text-slate-200">{data.assignee_role || 'Employee'}</strong></span>
        {data.step_type === 'ai_decision' && (
          <span className="text-purple-300 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI Logic
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-primary-400" />
    </div>
  );
};

export const WorkflowBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);

  const nodeTypes = useMemo(() => ({ customStep: StepCustomNode }), []);

  const loadWorkflow = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const wf = await api.getWorkflow(id);
      setWorkflow(wf);

      // Convert steps to React Flow nodes and edges
      const steps = wf.steps || [];
      const newNodes: Node[] = steps.map((s: any, idx: number) => {
        // Compute column or row layout
        const x = 300 + (idx % 2 === 0 ? 0 : 40);
        const y = 80 + idx * 140;

        return {
          id: s.id || `step-${s.order_index}`,
          type: 'customStep',
          position: { x, y },
          data: {
            ...s,
          },
        };
      });

      const newEdges: Edge[] = [];
      for (let i = 0; i < steps.length - 1; i++) {
        const fromStep = steps[i];
        const toStep = steps[i + 1];
        newEdges.push({
          id: `e-${fromStep.id || i}-${toStep.id || i + 1}`,
          source: fromStep.id || `step-${fromStep.order_index}`,
          target: toStep.id || `step-${toStep.order_index}`,
          animated: fromStep.step_type === 'ai_decision',
          style: { stroke: fromStep.step_type === 'ai_decision' ? '#A855F7' : '#6366F1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366F1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
          },
          eds
        )
      ),
    []
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const handleUpdateSelectedNode = (field: string, val: any) => {
    if (!selectedNode) return;
    const updatedData = { ...selectedNode.data, [field]: val };
    setSelectedNode({ ...selectedNode, data: updatedData });
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: updatedData } : n))
    );
  };

  const handleAddStep = (type: string = 'task') => {
    const nextOrder = nodes.length + 1;
    const newId = `new-step-${Date.now()}`;
    const titles: Record<string, string> = {
      task: 'Operational Task',
      approval: 'Threshold Review Sign-Off',
      ai_decision: 'AI Intelligent Routing & Anomaly Check',
      notification: 'Stakeholder Dispatch Notification',
      data_update: 'Database Ledger Sync',
      report: 'AI Audit Report Generation',
    };

    const newNode: Node = {
      id: newId,
      type: 'customStep',
      position: { x: 300, y: 80 + nodes.length * 140 },
      data: {
        order_index: nextOrder,
        step_type: type,
        name: titles[type] || 'New Step',
        description: 'Automated workflow action',
        assignee_role: type === 'approval' ? 'Manager' : 'Employee',
        config: {},
        next_step_order: nextOrder + 1,
      },
    };

    setNodes((prev) => [...prev, newNode]);

    // Connect from last node
    if (nodes.length > 0) {
      const prevNode = nodes[nodes.length - 1];
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${prevNode.id}-${newId}`,
          source: prevNode.id,
          target: newId,
          style: { stroke: '#6366F1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' },
        },
      ]);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
    );
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (!id || !workflow) return;
    setSaving(true);
    try {
      const formattedSteps = nodes.map((n, idx) => ({
        id: n.id.startsWith('new-') ? undefined : n.id,
        order_index: idx + 1,
        step_type: n.data.step_type,
        name: n.data.name,
        description: n.data.description,
        assignee_role: n.data.assignee_role,
        config: n.data.config || {},
        next_step_order: idx + 2 <= nodes.length ? idx + 2 : null,
      }));

      await api.updateWorkflow(id, {
        name: workflow.name,
        description: workflow.description,
        category: workflow.category,
        steps: formattedSteps,
      });

      alert('Workflow saved successfully!');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!id) return;
    setTesting(true);
    try {
      // Save first
      await handleSave();

      const res = await api.executeWorkflow(id, {
        expense_title: 'Builder Test Run - ' + new Date().toLocaleTimeString(),
        amount: 1250.0,
        currency: 'USD',
      });
      navigate(`/executions/${res.executionId}`);
    } catch (err: any) {
      alert('Test run error: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading Visual Workflow Canvas...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-4 md:-m-8 relative overflow-hidden bg-background">
      {/* Top Builder Toolbar */}
      <div className="h-14 bg-surface-100/90 border-b border-surface-300 px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            to={`/workflows/${id}`}
            className="p-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{workflow?.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-surface-300 text-primary-300 font-normal">
                Visual Graph Editor
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Add Step Dropdown */}
          <div className="relative group">
            <button className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-300 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition">
              <Plus className="w-3.5 h-3.5 text-primary-400" />
              <span>Add Node</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-surface-100 border border-surface-300 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
              {[
                { type: 'ai_decision', label: 'AI Decision Node', icon: Cpu, color: 'text-purple-400' },
                { type: 'approval', label: 'Approval Sign-Off', icon: ShieldCheck, color: 'text-amber-400' },
                { type: 'task', label: 'Human Task', icon: CheckCircle2, color: 'text-indigo-400' },
                { type: 'data_update', label: 'Database/ERP Sync', icon: Database, color: 'text-cyan-400' },
                { type: 'notification', label: 'Notification Dispatch', icon: Bell, color: 'text-teal-400' },
                { type: 'report', label: 'AI Report Generator', icon: FileCheck, color: 'text-violet-400' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleAddStep(btn.type)}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-200 text-xs text-slate-300 flex items-center gap-2 transition"
                >
                  <btn.icon className={`w-3.5 h-3.5 ${btn.color}`} />
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 border border-surface-300 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5 text-accent-cyan" />
            <span>{saving ? 'Saving...' : 'Save Graph'}</span>
          </button>

          <button
            onClick={handleTestRun}
            disabled={testing}
            className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{testing ? 'Testing...' : 'Test Run'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas and Inspector Drawer */}
      <div className="flex-1 flex relative">
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0B0F17]"
          >
            <Background color="#1E293B" gap={16} size={1} />
            <Controls className="!bg-surface-100 !border-surface-300 !text-slate-200 !rounded-xl" />
          </ReactFlow>
        </div>

        {/* Slide-out Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 bg-surface-100/95 border-l border-surface-300 p-5 flex flex-col justify-between shadow-2xl z-20 backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-300">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Node Inspector
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.data.name || ''}
                  onChange={(e) => handleUpdateSelectedNode('name', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Step Type
                </label>
                <select
                  value={selectedNode.data.step_type || 'task'}
                  onChange={(e) => handleUpdateSelectedNode('step_type', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="trigger">Trigger</option>
                  <option value="ai_decision">AI Decision</option>
                  <option value="approval">Approval</option>
                  <option value="task">Human Task</option>
                  <option value="data_update">Data Update / ERP Sync</option>
                  <option value="notification">Notification</option>
                  <option value="report">Report Generation</option>
                  <option value="end">End</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Assignee Role
                </label>
                <select
                  value={selectedNode.data.assignee_role || 'Employee'}
                  onChange={(e) => handleUpdateSelectedNode('assignee_role', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                  <option value="Automation Operator">Automation Operator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Description / Prompt
                </label>
                <textarea
                  rows={3}
                  value={selectedNode.data.description || ''}
                  onChange={(e) => handleUpdateSelectedNode('description', e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface-200 border border-surface-300 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                />
              </div>

              {selectedNode.data.step_type === 'ai_decision' && (
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-200 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-300" /> GenAI Routing Policy
                  </span>
                  <p className="text-[10px] text-slate-300">
                    Evaluates amount, risk score, and vendor trust before routing to approvers.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-surface-300">
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Node</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
