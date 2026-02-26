import { Pool } from 'pg';
import { Workflow } from '../interfaces';
import { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USERNAME, POSTGRES_PASSWORD, POSTGRES_DB } from '../config';

/**
 * WorkflowRepository is responsible for managing workflows in the database.
 */
export class WorkflowRepository {
  private dbPool: Pool;

  /**
   * Initialize the database connection pool.
   */
  constructor() {
    this.dbPool = new Pool({
      host: POSTGRES_HOST,
      port: POSTGRES_PORT,
      user: POSTGRES_USERNAME,
      password: POSTGRES_PASSWORD,
      database: POSTGRES_DB,
    });
  }

  /**
   * Retrieve a workflow by its ID.
   * @param id - The ID of the workflow to retrieve.
   * @returns The workflow with the specified ID, or null if not found.
   */
  async getWorkflowById(id: number): Promise<Workflow | null> {
    const query = {
      text: 'SELECT * FROM workflows WHERE id = $1',
      values: [id],
    };

    const result = await this.dbPool.query(query);
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Workflow;
  }

  /**
   * Retrieve all workflows for a given user.
   * @param userId - The ID of the user to retrieve workflows for.
   * @returns A list of workflows belonging to the specified user.
   */
  async getWorkflowsByUser(userId: number): Promise<Workflow[]> {
    const query = {
      text: 'SELECT * FROM workflows WHERE user_id = $1',
      values: [userId],
    };

    const result = await this.dbPool.query(query);
    return result.rows as Workflow[];
  }

  /**
   * Create a new workflow.
   * @param workflow - The workflow to create.
   * @returns The created workflow with its generated ID.
   */
  async createWorkflow(workflow: Workflow): Promise<Workflow> {
    const query = {
      text: 'INSERT INTO workflows (name, description) VALUES ($1, $2) RETURNING *',
      values: [workflow.name, workflow.description],
    };

    const result = await this.dbPool.query(query);
    return result.rows[0] as Workflow;
  }

  /**
   * Update an existing workflow.
   * @param workflow - The workflow to update.
   * @returns The updated workflow.
   */
  async updateWorkflow(workflow: Workflow): Promise<Workflow> {
    const query = {
      text: 'UPDATE workflows SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      values: [workflow.name, workflow.description, workflow.id],
    };

    const result = await this.dbPool.query(query);
    return result.rows[0] as Workflow;
  }

  /**
   * Delete a workflow by its ID.
   * @param id - The ID of the workflow to delete.
   * @returns Whether the deletion was successful.
   */
  async deleteWorkflow(id: number): Promise<boolean> {
    const query = {
      text: 'DELETE FROM workflows WHERE id = $1',
      values: [id],
    };

    const result = await this.dbPool.query(query);
    return result.rowCount > 0;
  }

  /**
   * TODO: Implement pagination for retrieving workflows.
   */
  async getWorkflows(offset: number, limit: number): Promise<Workflow[]> {
    const query = {
      text: 'SELECT * FROM workflows OFFSET $1 LIMIT $2',
      values: [offset, limit],
    };

    const result = await this.dbPool.query(query);
    return result.rows as Workflow[];
  }

  /**
   * FIXME: This method is not yet implemented and should be removed or replaced.
   */
  async getWorkflowCount(): Promise<number> {
    throw new Error('Not implemented');
  }

  /**
   * Retrieve the workflow execution history for a given workflow.
   * @param workflowId - The ID of the workflow to retrieve execution history for.
   * @returns A list of workflow execution history entries.
   */
  async getWorkflowExecutionHistory(workflowId: number): Promise<any[]> {
    const query = {
      text: 'SELECT * FROM workflow_executions WHERE workflow_id = $1',
      values: [workflowId],
    };

    const result = await this.dbPool.query(query);
    return result.rows;
  }
}
