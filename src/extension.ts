import * as vscode from "vscode";
import { Commands } from './enum';
import { Prompt } from './prompt';
import Server from "./server";
import { Settings } from './Settings';
import { StatusbarUi } from "./StatusBarUI";

export function activate(context: vscode.ExtensionContext) {

  const output = vscode.window.createOutputChannel("Mock Server Log");
  const log = (message: string, newLine: string = '') => output.appendLine(`${newLine}[${new Date().toLocaleTimeString()}] ${message}`);

  const server = new Server(log);

  // Transform Mock
  context.subscriptions.push(vscode.commands.registerCommand(Commands.TRANSFORM_TO_MOCK_SERVER_DB, async (args) => {
    try {
      log('[Running] Data Transform initiated', '\n');
      log('Data Transforming...');
      await server.transformToMockServerDB(args);
      log('[Done] Data Transformed Successfully');
    } catch (error: any) {
      log('[Done] Failed to Transform Data');
      log(error);
      Prompt.showPopupMessage(`Failed to Transform Data. \n${error.message}`, 'error');
    }
  }));

  // Start Server
  context.subscriptions.push(vscode.commands.registerCommand(Commands.START_SERVER, server.restartServer));

  // Stop Server
  context.subscriptions.push(vscode.commands.registerCommand(Commands.STOP_SERVER, async (args) => {
    try {
      log(`[Running] Server Stop initiated`, '\n');
      log(`Server Stopping...`);
      StatusbarUi.working('Stopping...');
      await server.stopServer(args);
      const statusMsg = `Server is Stopped`;
      log(`[Done] ${statusMsg}`);
      StatusbarUi.startServer(150, () => Prompt.showPopupMessage(statusMsg, 'info'));
    } catch (error: any) {
      if (error.message === "No Server to Stop") {
        log(`[Done] No Server to Stop`);
        StatusbarUi.startServer(150, () => Prompt.showPopupMessage('No Server to Stop', 'error'));
      } else {
        log(`[Done] Server Failed to Stop`);
        log(error);
        const statsMsg = `Server Failed to Stop. \n${error.message}`;
        StatusbarUi.stopServer(0, Settings.port, () => Prompt.showPopupMessage(statsMsg, 'error'));
      }
    }
  }));

  // Reset Server
  context.subscriptions.push(vscode.commands.registerCommand(Commands.RESET_SERVER, async (args) => {
    try {
      log(`[Running] Server Reset initiated`, "\n");
      log(`Server Resetting...`);
      StatusbarUi.working('Resetting...');
      await server.resetServer();
      const statusMsg = `Server Reset Done`;
      log(`[Done] ${statusMsg}`);
      StatusbarUi.startServer(150, () => Prompt.showPopupMessage(statusMsg, 'info'));
    } catch (error: any) {
      log(`[Done] Server Failed to Reset`);
      log(error);
      const statsMsg = `Server Failed to Reset. \n${error.message}`;
      Prompt.showPopupMessage(statsMsg, 'error');
    }
  }));

  // Reset and Restart Server
  context.subscriptions.push(vscode.commands.registerCommand(Commands.RESET_AND_RESTART, async (args) => {
    try {
      log(`[Running] Server Reset initiated`, "\n");
      log(`Server Resetting...`);
      StatusbarUi.working('Resetting...');
      await server.resetServer();
      log(`[Done] Server Reset done`, "\n");
      await server.restartServer(args);
    } catch (error: any) {
      log(`[Done] Server Failed to Reset`);
      log(error);
      const statsMsg = `Server Failed to Reset. \n${error.message}`;
      Prompt.showPopupMessage(statsMsg, 'error');
    }
  }));

  // Switch Environment
  context.subscriptions.push(vscode.commands.registerCommand(Commands.SWITCH_ENVIRONMENT, server.switchEnvironment));

  // Get Db Snapshot
  context.subscriptions.push(vscode.commands.registerCommand(Commands.GET_DB_SNAPSHOT, async (args) => {
    try {
      log(`[Running] Db Snapshot initiated`, "\n");
      log(`Getting Db Snapshot..`);
      await server.getDbSnapshot(args);
      log(`[Done] Db Snapshot retrieved Successfully`);
    } catch (error: any) {
      log(`[Done] Failed to get Db Snapshot`);
      log(error);
      Prompt.showPopupMessage(`Failed to get Db Snapshot. \n${error.message}`, 'error');
    }
  }));

  // Set Port
  context.subscriptions.push(vscode.commands.registerCommand(Commands.SET_PORT, server.setPort));

  // Set Root
  context.subscriptions.push(vscode.commands.registerCommand(Commands.SET_ROOT, server.setRoot));

  // Create Sample Files
  context.subscriptions.push(vscode.commands.registerCommand(Commands.GENERATE_MOCK_FILES, async (args) => {
    try {
      log(`[Running] Creating Samples initiated`, "\n");
      log('\nCreating Samples...');
      await server.generateMockFiles(args);
      log('[Done] Sample files created.');
    } catch (error: any) {
      log(`[Done] Failed to Create Samples`);
      log(error);
      Prompt.showPopupMessage(`Failed to Create Samples. \n${error.message}`, 'error');
    }
  }));

  // show status bar
  context.subscriptions.push(StatusbarUi.statusBarItem);
}
export function deactivate() { }
