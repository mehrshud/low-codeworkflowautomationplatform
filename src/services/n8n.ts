import { Workflow } from 'src/models/Workflow';
import { User } from 'src/models/User';
import { UserRepository } from 'src/repositories/UserRepository';
import { WorkflowRepository } from 'src/repositories/WorkflowRepository';
import { config } from 'src/config';
import { helpers } from 'src/utils/helpers';
import { errors } from 'src/utils/errors';

/**
 * N8n Service class.
 * Handles n8n related workflow operations.
 */
class N8nService {
  private userRepository: UserRepository;
  private workflowRepository: WorkflowRepository;

  constructor(userRepository: UserRepository, workflowRepository: WorkflowRepository) {
    this.userRepository = userRepository;
    this.workflowRepository = workflowRepository;
  }

  /**
   * Triggers a workflow using n8n.
   * 
   * @param workflow Workflow object.
   * @param user User object.
   */
  async triggerWorkflow(workflow: Workflow, user: User): Promise<void> {
    // TODO: Handle workflow trigger errors
    try {
      // Authenticate with n8n
      const n8nUrl = `http://${config.n8nHost}:${config.n8nPort}`;
      const n8nToken = await this.getN8nToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nToken}`,
      };

      // Trigger workflow
      const workflowTriggerUrl = `${n8nUrl}/api/${config.API_VERSION}/workflows/${workflow.id}/trigger`;
      const response = await helpers.post(workflowTriggerUrl, headers);
      if (response.status !== 200) {
        throw new errors.N8nTriggerError(`Failed to trigger workflow ${workflow.id}`);
      }
    } catch (error) {
      throw new errors.N8nTriggerError(`Failed to trigger workflow ${workflow.id}: ${error.message}`);
    }
  }

  /**
   * Retrieves an n8n token.
   * 
   * @returns N8n token.
   */
  private async getN8nToken(): Promise<string> {
    const n8nUrl = `http://${config.n8nHost}:${config.n8nPort}`;
    const authUrl = `${n8nUrl}/api/${config.API_VERSION}/auth/login`;
    const credentials = {
      username: config.n8nUsername,
      password: config.n8nPassword,
    };
    const response = await helpers.post(authUrl, credentials);
    return response.token;
  }

  /**
   * Retrieves a list of workflows from n8n.
   * 
   * @param user User object.
   * @returns List of workflows.
   */
  async getWorkflows(user: User): Promise<Workflow[]> {
    // Retrieve workflows from database
    const workflows = await this.workflowRepository.getWorkflows(user.id);
    return workflows;
  }

  /**
   * Saves a workflow to n8n.
   * 
   * @param workflow Workflow object.
   * @param user User object.
   */
  async saveWorkflow(workflow: Workflow, user: User): Promise<void> {
    try {
      // Authenticate with n8n
      const n8nUrl = `http://${config.n8nHost}:${config.n8nPort}`;
      const n8nToken = await this.getN8nToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nToken}`,
      };

      // Save workflow to n8n
      const workflowSaveUrl = `${n8nUrl}/api/${config.API_VERSION}/workflows`;
      const response = await helpers.post(workflowSaveUrl, headers, workflow);
      if (response.status !== 200) {
        throw new errors.N8nSaveError(`Failed to save workflow ${workflow.id}`);
      }

      // Save workflow to database
      await this.workflowRepository.saveWorkflow(workflow, user.id);
    } catch (error) {
      throw new errors.N8nSaveError(`Failed to save workflow ${workflow.id}: ${error.message}`);
    }
  }

  /**
   * Deletes a workflow from n8n.
   * 
   * @param workflow Workflow object.
   * @param user User object.
   */
  async deleteWorkflow(workflow: Workflow, user: User): Promise<void> {
    try {
      // Authenticate with n8n
      const n8nUrl = `http://${config.n8nHost}:${config.n8nPort}`;
      const n8nToken = await this.getN8nToken();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${n8nToken}`,
      };

      // Delete workflow from n8n
      const workflowDeleteUrl = `${n8nUrl}/api/${config.API_VERSION}/workflows/${workflow.id}`;
      const response = await helpers.delete(workflowDeleteUrl, headers);
      if (response.status !== 200) {
        throw new errors.N8nDeleteError(`Failed to delete workflow ${workflow.id}`);
      }

      // Delete workflow from database
      await this.workflowRepository.deleteWorkflow(workflow.id, user.id);
    } catch (error) {
      throw new errors.N8nDeleteError(`Failed to delete workflow ${workflow.id}: ${error.message}`);
    }
  }

  /**
   * Gets the details of a workflow.
   * 
   * @param workflow Workflow object.
   * @param user User object.
   * @returns Workflow details.
   */
  async getWorkflowDetails(workflow: Workflow, user: User): Promise<Workflow> {
    // Retrieve workflow details from database
    const workflowDetails = await this.workflowRepository.getWorkflowDetails(workflow.id, user.id);
    // TODO: Implement pagination for workflow details
    // TODO: Handle workflow details retrieval errors
    return workflowDetails;
  }
}

export const n8nService = new N8nService(new UserRepository(), new WorkflowRepository());
