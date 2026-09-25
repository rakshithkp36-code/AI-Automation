import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { geminiService } from '../services/gemini.service.js';

const router = Router();
router.use(authenticateToken);

// Status of Gemini service
router.get('/status', (req: Request, res: Response) => {
  res.json({
    active: true,
    hasApiKey: geminiService.hasApiKey(),
    model: 'gemini-2.5-flash',
    mode: geminiService.hasApiKey() ? 'live_google_genai' : 'intelligent_heuristic_engine',
  });
});

// Analyze Problem
router.post('/analyze-problem', async (req: Request, res: Response) => {
  try {
    const analysis = await geminiService.analyzeProblem(req.body);
    res.json(analysis);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Generate Workflow
router.post('/generate-workflow', async (req: Request, res: Response) => {
  try {
    const workflow = await geminiService.generateWorkflow(req.body);
    res.json(workflow);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Route Workflow
router.post('/route-workflow', async (req: Request, res: Response) => {
  try {
    const result = await geminiService.routeWorkflow(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Analyze Performance
router.post('/analyze-performance', async (req: Request, res: Response) => {
  try {
    const result = await geminiService.analyzePerformance(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Generate Report
router.post('/generate-report', async (req: Request, res: Response) => {
  try {
    const result = await geminiService.generateReport(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
