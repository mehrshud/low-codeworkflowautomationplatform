// src/api/routes.ts

import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Workflow } from '../models/Workflow';
import { UserRepository } from '../repositories/UserRepository';
import { WorkflowRepository } from '../repositories/WorkflowRepository';
import { n8nService } from '../services/n8n';
import { LangChainService } from '../services/LangChain';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { API_VERSION, DEFAULT_TIMEOUT } from '../config';

const router = Router();

// Helper function to handle errors
function handleError(res: Response, error: any) {
  console.error(error);
  res.status(500).send({ message: 'Internal Server Error' });
  // console.log('Error details:', error.stack); // debugging
}

// GET /users - Retrieve all users
router.get(`${API_VERSION}/users`, async (req: Request, res: Response) => {
  try {
    const userRepository = new UserRepository();
    const userList: User[] = await userRepository.findAll();
    res.json(userList);
  } catch (error) {
    handleError(res, error);
  }
});

// GET /workflows - Retrieve all workflows
router.get(`${API_VERSION}/workflows`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const workflowRepository = new WorkflowRepository();
    const workflowList: Workflow[] = await workflowRepository.findAll();
    // TODO: implement pagination for large workflow lists
    res.json(workflowList);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /workflows - Create a new workflow
router.post(`${API_VERSION}/workflows`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const workflowRepository = new WorkflowRepository();
    const newWorkflow: Workflow = await workflowRepository.create(name, description);
    res.json(newWorkflow);
  } catch (error) {
    // FIXME: error handling for duplicate workflow names
    handleError(res, error);
  }
});

// GET /workflows/:id - Retrieve a workflow by ID
router.get(`${API_VERSION}/workflows/:id`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflowRepository = new WorkflowRepository();
    const workflowDetails: Workflow | null = await workflowRepository.findById(workflowId);
    if (!workflowDetails) {
      res.status(404).send({ message: 'Workflow not found' });
    } else {
      res.json(workflowDetails);
    }
  } catch (error) {
    handleError(res, error);
    // console.log(' Workflow ID:', req.params.id); // debugging
  }
});

// PUT /workflows/:id - Update a workflow
router.put(`${API_VERSION}/workflows/:id`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const { name, description } = req.body;
    const workflowRepository = new WorkflowRepository();
    const updatedWorkflow: Workflow | null = await workflowRepository.update(workflowId, name, description);
    if (!updatedWorkflow) {
      res.status(404).send({ message: 'Workflow not found' });
    } else {
      res.json(updatedWorkflow);
    }
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /workflows/:id - Delete a workflow
router.delete(`${API_VERSION}/workflows/:id`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflowRepository = new WorkflowRepository();
    await workflowRepository.delete(workflowId);
    res.status(204).send();
    // TODO: add logic to clean up related data after workflow deletion
  } catch (error) {
    handleError(res, error);
  }
});

// Helper function to trigger n8n workflow
function triggerN8nWorkflow(workflowId: string) {
  // console.log('Triggering n8n workflow:', workflowId); // debugging
  n8nService.triggerWorkflow(workflowId);
}

// Helper function to trigger LangChain workflow
function triggerLangChainWorkflow(workflowId: string) {
  LangChainService.triggerWorkflow(workflowId);
}

// POST /workflows/:id/trigger - Trigger a workflow
router.post(`${API_VERSION}/workflows/:id/trigger`, authenticate, authorize, async (req: Request, res: Response) => {
  try {
    const workflowId = req.params.id;
    const workflowRepository = new WorkflowRepository();
    const workflowDetails: Workflow | null = await workflowRepository.findById(workflowId);
    if (!workflowDetails) {
      res.status(404).send({ message: 'Workflow not found' });
    } else {
      if (workflowDetails.name === 'n8n') {
        triggerN8nWorkflow(workflowId);
      } else if (workflowDetails.name === 'LangChain') {
        triggerLangChainWorkflow(workflowId);
      }
      res.send({ message: 'Workflow triggered successfully' });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Export the router
export default router;
