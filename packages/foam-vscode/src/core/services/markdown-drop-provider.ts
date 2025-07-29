import * as vscode from 'vscode';
import * as path from 'path';

export class CustomMarkdownDropProvider implements vscode.DocumentDropEditProvider {
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
    const documentNameWithoutExtension = documentNameDotIndex > 0 ? documentName.substring(0, documentNameDotIndex) : documentName; 
    const fileName = path.basename(filePathUri.fsPath);
    const fileNameDotIndex = fileName.indexOf('.', 1); 
    const fileNameWithoutExtension = fileNameDotIndex > 0 ? fileName.substring(0, fileNameDotIndex) : fileName; 
    
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
    
    const finalTargetLink = encodeURI(targetRelPath);

    const altText = fileNameWithoutExtension;
    const text = new vscode.SnippetString("![${1:" + altText + "}]("+ finalTargetLink + ")");
    let ret: vscode.DocumentDropEdit = new vscode.DocumentDropEdit(text);
    return ret;
  }
}
