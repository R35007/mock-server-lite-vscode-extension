import { MockServer } from "@r35007/mock-server-lite";
import { getJSON } from "@r35007/mock-server-lite/dist/server/utils/fetch";
import axios from 'axios';
import { watch, FSWatcher } from 'chokidar';
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { TRANSFORM_TO_MOCK_SERVER_DB } from './enum';
import { Prompt } from "./prompt";
import { Settings } from "./Settings";


export class Utils {
  mockServer: MockServer;
  environment = "none";
  output;

  watcher: FSWatcher | undefined;

  constructor() {
    this.mockServer = new MockServer({ root: Settings.paths.root });
    this.output = vscode.window.createOutputChannel("Mock Server Log");
  }

  protected getEditorProps = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const firstLine = document.lineAt(0);
      const lastLine = document.lineAt(document.lineCount - 1);
      const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
      const editorText = document.getText(textRange);
      const selectedText = document.getText(selection);
      return { editor, document, selection, textRange, editorText, selectedText };
    }

    return false;
  };

  protected getWritable = async (extensions: string[], action: string, noPrompt: boolean = false) => {
    const editorProps = this.getEditorProps();

    if (editorProps) {
      const { editor, document, textRange, editorText } = editorProps;

      if ((action === TRANSFORM_TO_MOCK_SERVER_DB) && !editorProps.editorText.trim().length) {
        const extension = path.extname(path.resolve(document.fileName));
        if (extensions.indexOf(extension) < 0) return false;
      }

      if (noPrompt) {
        return { editorText, fileName: "", editor, document, textRange };
      }

      const shouldSaveAsNewFile = await Prompt.shouldSaveAsNewFile();

      if (shouldSaveAsNewFile) {
        if (shouldSaveAsNewFile === "yes") {
          const fileName = await Prompt.getFilePath(extensions);
          if (fileName && fileName.length) {
            return { editorText, fileName, editor, document, textRange };
          }
          return false;
        } else {
          return { editorText, fileName: "", editor, document, textRange };
        }
      }
      return false;
    }
    return false;
  };

  protected writeFile = async (
    data: any,
    fileName: string,
    notificationText: string,
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    textRange: vscode.Range
  ) => {
    if (fileName.length) {
      const filePath = path.resolve(path.dirname(document.fileName), fileName);
      const folderPath = path.dirname(filePath) || "/";
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      fs.writeFileSync(filePath, data);
      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc, undefined, true);
      Prompt.showPopupMessage(notificationText, "info");
    } else {
      editor.edit((editBuilder) => {
        editBuilder.replace(textRange, data);
        Prompt.showPopupMessage(notificationText, "info");
      });
    }
  };

  protected getDataFromUrl = async (dbPath?: string) => {
    if (!dbPath) return;
    if (dbPath.startsWith("http")) {
      const data = await axios.get(dbPath).then(resp => resp.data).catch(_err => { });
      return data;
    } else {
      return getJSON(dbPath);
    }
  }

  protected restartOnChange = (restart: Function) => {
    if (!this.watcher) {
      const filesToWatch = ([
        Settings.paths.db,
        Settings.paths.middleware,
        Settings.paths.injectors,
        Settings.paths.rewriters,
        Settings.paths.store,
        Settings.paths.staticDir,
      ]).filter(p => !p?.startsWith("http")).filter(Boolean) as string[];

      this.watcher = watch(filesToWatch);
      this.watcher.on('change', (_event, _path) => {
        restart();
      });
    }
  }

  protected stopWatchingChanges = async () => {
    this.watcher && await this.watcher.close();
    this.watcher = undefined;
  }
}
