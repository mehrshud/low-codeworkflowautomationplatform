// Import necessary modules and interfaces
import { FastAPI } from 'fastapi';
import { User, Workflow } from '../interfaces';
import { UserRepository, WorkflowRepository } from '../repositories';
import { n8nService, LangChainService } from '../services';
import { authMiddleware, authorizeMiddleware } from '../middleware';
import { postgresDB } from '../db/postgres';
import { API_VERSION, DEFAULT_TIMEOUT } from '../config';

// Initialize API controllers class
class APIControllers {
  private app: FastAPI;
  private userRepository: UserRepository;
  private workflowRepository: WorkflowRepository;

  constructor(app: FastAPI) {
    this.app = app;
    this.userRepository = new UserRepository(postgresDB);
    this.workflowRepository = new WorkflowRepository(postgresDB);
  }

  // Helper function to get user by ID
  async getUserById(userId: number): Promise<User | null> {
    return this.userRepository.getUserById(userId);
  }

  // Helper function to get workflow by ID
  async getWorkflowById(workflowId: number): Promise<Workflow | null> {
    return this.workflowRepository.getWorkflowById(workflowId);
  }

  // API endpoint to create a new user
  async createUser(user: User): Promise<User> {
    // TODO: Implement password hashing
    const createdUser = await this.userRepository.createUser(user);
    return createdUser;
  }

  // API endpoint to create a new workflow
  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    const createdWorkflow = await this.workflowRepository.createWorkflow(workflow);
    // FIXME: Handle workflow creation errors
    return createdWorkflow;
  }

  // API endpoint to automate a workflow using n8n and LangChain
  async automateWorkflow(workflowId: number): Promise<void> {
    const workflow = await this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found with ID ${workflowId}`);
    }

    // Initialize n8n and LangChain services
    const n8n = new n8nService();
    const langChain = new LangChainService();

    // Authenticate user and authorize workflow automation
    const user = await this.getUserById(1); // Hardcoded user ID for now
    if (!user) {
      throw new Error('User not found');
    }
    const authorized = await authorizeMiddleware(user, workflow);
    if (!authorized) {
      throw new Error('Unauthorized to automate workflow');
    }

    // Automate workflow using n8n and LangChain
    try {
      await n8n.automateWorkflow(workflow);
      await langChain.processWorkflow(workflow);
    } catch (error) {
      // Log error and continue execution
      console.error(error);
    }

    // Update workflow status to automated
    await this.workflowRepository.updateWorkflowStatus(workflowId, 'automated');
  }
}

export default APIControllers;
