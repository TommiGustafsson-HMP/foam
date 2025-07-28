/*global markdownit:readonly*/

import { workspace, ExtensionContext, window, commands } from 'vscode';
import { MarkdownResourceProvider } from './core/services/markdown-provider';
import { bootstrap } from './core/model/foam';
import { Logger } from './core/utils/log';

import { features } from './features';
import { VsCodeOutputLogger, exposeLogger } from './services/logging';
import {
  getAttachmentsExtensions,
  getIgnoredFilesSetting,
  getNotesExtensions,
} from './settings';
import { AttachmentResourceProvider } from './core/services/attachment-provider';
import { VsCodeWatcher } from './services/watcher';
import { createMarkdownParser } from './core/services/markdown-parser';
import VsCodeBasedParserCache from './services/cache';
import { createMatcherAndDataStore } from './services/editor';
import * as vscode from 'vscode';
import * as path from 'path';
import { config } from 'process';
import { getFoamVsCodeConfig } from './services/config';
import { add } from 'lodash';
import { start } from 'repl';

export async function activate(context: ExtensionContext) {
  const logger = new VsCodeOutputLogger();
  Logger.setDefaultLogger(logger);
  exposeLogger(context, logger);

  try {
    Logger.info('Starting Foam');

    if (workspace.workspaceFolders === undefined) {
      Logger.info('No workspace open. Foam will not start');
      return;
    }

    // Prepare Foam
    const excludes = getIgnoredFilesSetting().map(g => g.toString());
    const { matcher, dataStore, excludePatterns } =
      await createMatcherAndDataStore(excludes);

    Logger.info('Loading from directories:');
    for (const folder of workspace.workspaceFolders) {
      Logger.info('- ' + folder.uri.fsPath);
      Logger.info('  Include: **/*');
      Logger.info('  Exclude: ' + excludePatterns.get(folder.name).join(','));
    }

    const watcher = new VsCodeWatcher(
      workspace.createFileSystemWatcher('**/*')
    );
    const parserCache = new VsCodeBasedParserCache(context);
    const parser = createMarkdownParser([], parserCache);

    const { notesExtensions, defaultExtension } = getNotesExtensions();

    const markdownProvider = new MarkdownResourceProvider(
      dataStore,
      parser,
      notesExtensions
    );

    const attachmentExtConfig = getAttachmentsExtensions();
    const attachmentProvider = new AttachmentResourceProvider(
      attachmentExtConfig
    );

    const foamPromise = bootstrap(
      matcher,
      watcher,
      dataStore,
      parser,
      [markdownProvider, attachmentProvider],
      defaultExtension
    );

    // Load the features
    const featuresPromises = features.map(feature =>
      feature(context, foamPromise)
    );

    const foam = await foamPromise;
    Logger.info(`Loaded ${foam.workspace.list().length} resources`);

    context.subscriptions.push(
      foam,
      watcher,
      markdownProvider,
      attachmentProvider,
      commands.registerCommand('foam-vscode.clear-cache', () =>
        parserCache.clear()
      ),
      workspace.onDidChangeConfiguration(e => {
        if (
          [
            'foam.files.ignore',
            'foam.files.attachmentExtensions',
            'foam.files.noteExtensions',
            'foam.files.defaultNoteExtension',
          ].some(setting => e.affectsConfiguration(setting))
        ) {
          window.showInformationMessage(
            'Foam: Reload the window to use the updated settings'
          );
        }
      })
    );

    const useCustomFileDropdownProvider = getFoamVsCodeConfig('use-custom-file-dropdown-provider');
    if (useCustomFileDropdownProvider) {
      context.subscriptions.push(
        vscode.languages.registerDocumentDropEditProvider(
          { language: 'markdown' },
          new CustomMarkdownDropProvider()
        )
      );
    }

    const feats = (await Promise.all(featuresPromises)).filter(r => r != null);

    return {
      extendMarkdownIt: (md: markdownit) => {
        return feats.reduce((acc: markdownit, r: any) => {
          return r.extendMarkdownIt ? r.extendMarkdownIt(acc) : acc;
        }, md);
      },
      foam,
    };
  } catch (e) {
    Logger.error('An error occurred while bootstrapping Foam', e);
    window.showErrorMessage(
      `An error occurred while bootstrapping Foam. ${e.stack}`
    );
  }
}

class CustomMarkdownDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentDropEdit | undefined> {
    const fileUri = dataTransfer.get("text/uri-list").value;
    const filePathUri = vscode.Uri.parse(fileUri);
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const documentRelPath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath).replace(/\\/g, "/");
    const documentLastIndexOfSlash = documentRelPath.lastIndexOf('/');
    const documentRelativeDirectory = documentLastIndexOfSlash >= 0 ? documentRelPath.substring(0, documentLastIndexOfSlash) : "";
    const documentName = path.basename(documentRelPath);
    const documentNameDotIndex = documentName.indexOf('.', 1); 
    const documentNameWithoutExtension = documentNameDotIndex > 1 ? documentName.substring(0, documentNameDotIndex) : documentName; 
    const fileName = path.basename(filePathUri.fsPath);
    const fileNameDotIndex = fileName.indexOf('.', 1); 
    const fileNameWithoutExtension = fileNameDotIndex > 1 ? fileName.substring(0, fileNameDotIndex) : fileName; 
    
    let documentAndFileRelativeDirectory = documentNameWithoutExtension;
    if (documentRelativeDirectory.length > 0) {
      documentAndFileRelativeDirectory = documentRelativeDirectory + "/" + documentNameWithoutExtension;
    }

    let targetRelPath = "/uploads/";
    if (documentAndFileRelativeDirectory !== '') {
      targetRelPath += documentAndFileRelativeDirectory + "/";
    }
    targetRelPath += fileName;

    const targetFsPath = workspaceFolder.uri.path + targetRelPath;
    const targetFsPathUri = vscode.Uri.file(targetFsPath);
    await vscode.workspace.fs.copy(filePathUri, targetFsPathUri, {
      overwrite: true
    });

    const altText = fileNameWithoutExtension;
    const text = new vscode.SnippetString("![${1:" + altText + "}]("+ targetRelPath + ")");
    let ret: vscode.DocumentDropEdit = new vscode.DocumentDropEdit(text);
    return ret;
  }
}