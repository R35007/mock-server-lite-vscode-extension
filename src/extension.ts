import * as vscode from "vscode";
import { GENERATE_MOCK_FILES, TRANSFORM_TO_MOCK_SERVER_DB, GET_DB_SNAPSHOT, START_SERVER, STOP_SERVER } from './enum';
import { StatusbarUi } from "./StatusBarUI";
import Server from "./server";

export function activate(context: vscode.ExtensionContext) {
  const server = new Server();

  // Generate Mock
  context.subscriptions.push(vscode.commands.registerCommand(TRANSFORM_TO_MOCK_SERVER_DB, server.transformToMockServerDB));

  // Start Server
  context.subscriptions.push(vscode.commands.registerCommand(START_SERVER, server.restartServer));

  // Stop Server
  context.subscriptions.push(vscode.commands.registerCommand(STOP_SERVER, server.stopServer));

  // Get Db Snapshot
  context.subscriptions.push(vscode.commands.registerCommand(GET_DB_SNAPSHOT, server.getDbSnapshot));
  
  // Create Sample Files
  context.subscriptions.push(vscode.commands.registerCommand(GENERATE_MOCK_FILES, server.generateMockFiles));
  
  // show status bar
  context.subscriptions.push(StatusbarUi.statusBarItem);
}
export function deactivate() { }
