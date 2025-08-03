import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { getFoamVsCodeConfig } from '../../services/config';
import { imageExtensions } from '../../core/services/attachment-provider';

export class CustomMarkdownDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentDropEdit | undefined> {
    const fileTemplateFormat = getFoamVsCodeConfig("file-dropdown.file-template-format"); 
    const imageTemplateFormat = getFoamVsCodeConfig("file-dropdown.image-template-format"); 

    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const uploadsFolder = path.join(workspaceFolder.uri.fsPath, "uploads").replace(/\\/g, "/") + '/';
    const workspaceFolderPath = workspaceFolder.uri.path + '/';

    const files = dataTransfer.get("text/uri-list").value.split(/\r?\n/);
    let text = '';

    for(const file of files) {
      const filePathUri = vscode.Uri.parse(file);
      const fileName = path.basename(filePathUri.fsPath);
      const fileNameDotIndex = fileName.indexOf('.', 1); 
      const fileNameWithoutExtension = fileNameDotIndex > 0 ? fileName.substring(0, fileNameDotIndex) : fileName; 
      const fileExtension = fileNameDotIndex > 0 ? fileName.substring(fileNameDotIndex) : '';
      const isImage = imageExtensions.includes(fileExtension.toLowerCase());

      const documentRelPath = path.relative(workspaceFolder.uri.fsPath, document.uri.fsPath).replace(/\\/g, "/");
      const documentLastIndexOfSlash = documentRelPath.lastIndexOf('/');
      const documentRelativeDirectory = documentLastIndexOfSlash >= 0 ? documentRelPath.substring(0, documentLastIndexOfSlash) : "";
      const documentName = path.basename(documentRelPath);
      const documentNameDotIndex = documentName.indexOf('.', 1); 
      const documentNameWithoutExtension = documentNameDotIndex > 0 ? documentName.substring(0, documentNameDotIndex) : documentName; 
      
      let documentAndFileRelativeDirectory = documentNameWithoutExtension;
      if (documentRelativeDirectory.length > 0) {
        documentAndFileRelativeDirectory = documentRelativeDirectory + "/" + documentNameWithoutExtension;
      }

      let targetRelPath = '';
      if(filePathUri.path.startsWith(workspaceFolderPath)) {
        const fileRelPath = path.relative(workspaceFolder.uri.fsPath, filePathUri.fsPath).replace(/\\/g, "/");
        targetRelPath = '/' + fileRelPath;
      } else {
        targetRelPath = "/uploads/";
        if (documentAndFileRelativeDirectory !== '') {
          targetRelPath += documentAndFileRelativeDirectory + "/";
        }
        targetRelPath += fileName;

        const targetFsPath = workspaceFolder.uri.path + targetRelPath;
        const targetFsPathUri = vscode.Uri.file(targetFsPath);
        await vscode.workspace.fs.copy(filePathUri, targetFsPathUri, {
          overwrite: true
        });
      }
      
      const finalTargetLink = encodeURI(targetRelPath);
      const altText = fileNameWithoutExtension;

      if (files.length === 1) {
        text += "![${1:" + altText + "}]("+ finalTargetLink + ")";
      } else {
        if (text.length > 0) {
          text += os.EOL;
        }
        text += "![" + altText + "]("+ finalTargetLink + ")";
      }
    }

    const textSnippet = new vscode.SnippetString(text);
    let ret: vscode.DocumentDropEdit = new vscode.DocumentDropEdit(textSnippet);
    return ret;
  }
}
