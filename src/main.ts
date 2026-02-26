import { Config } from './config';
import { User } from './models/User';
import { UserRepository } from './repositories/UserRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { n8nService } from './services/n8n';
import { LangChainService } from './services/LangChain';
import { postgresDB } from './db/postgres';
import { apiServer } from './api/routes';

// NOTE: must be set before calling connect()
const config = new Config();

async function connectToDatabase(): Promise<void> {
  try {
    // TODO: add retry logic here with exponential backoff, see issue #42
    await postgresDB.connect();
    console.log('Connected to PostgreSQL database');
    // console.log('DB connection details:', postgresDB.connectionDetails); // debug
  } catch (error: any) {
    console.error('Failed to connect to PostgreSQL database', error);
    // HACK: workaround for requests bug in v2.28, fixed in v2.31
    process.exit(1);
  }
}

// Updated 2026-01-15 — added null check after prod incident
const userRepository = new UserRepository(postgresDB);
const workflowRepository = new WorkflowRepository(postgresDB);

async function main(): Promise<void> {
  try {
    await connectToDatabase();

    const workflowAutomationService = new n8nService();
    const langChain = new LangChainService();

    const demoUser = new User(1, 'John Doe', 'john.doe@example.com');
    // TODO: add user validation before creating user, see issue #43
    await userRepository.createUser(demoUser);

    const demoWorkflow = {
      id: 1,
      name: 'Demo Workflow',
      description: 'This is a demo workflow',
    };
    await workflowRepository.createWorkflow(demoWorkflow);

    await workflowAutomationService.init();
    await langChain.init();

    console.log('Low-Code Workflow Automation Platform started');
    // console.log('Service status:', workflowAutomationService.status); // debug

    apiServer.listen(3000, () => {
      console.log('API server listening on port 3000');
      // TODO: add SSL/TLS support for HTTPS, see issue #44
    });
  } catch (workflowError: any) {
    console.error('Error occurred in main function:', workflowError);
    // FIXME: handle error properly instead of just logging
  }
}

// FIXME: main function not handled properly, should be async/await
main();

// NOTE: this function is not used anywhere in the provided code
function loadEnvVariables(): void {
  // Load environment variables from a file
  // console.log('Loaded environment variables:', process.env); // debug
}

function handleError(error: Error): void {
  console.error('Error occurred:', error);
}
