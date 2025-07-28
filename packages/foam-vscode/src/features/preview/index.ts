/*global markdownit:readonly*/

import * as vscode from 'vscode';
import { Foam } from '../../core/model/foam';
import { default as markdownItFoamTags } from './tag-highlight';
import { default as markdownItWikilinkNavigation } from './wikilink-navigation';
import { default as markdownItRemoveLinkReferences } from './remove-wikilink-references';
import { default as markdownItWikilinkEmbed } from './wikilink-embed';
import * as path from 'path';

export function htmlRule (tokens, idx, options, env, self) {
  const token = tokens[idx];
  
  if (token.content.startsWith('<img ')) {
    const hasRootSrc = token.content.indexOf('src="/') >= 0;
    if(hasRootSrc) {
      const newContent = token.content.replace(/src="(\/[^"]+)"/, function (match, p1) {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const srcPath = path.join(workspaceFolder.uri.fsPath, p1).replace(/\\/g, "/");
        const vsCodePath = "https://file+.vscode-resource.vscode-cdn.net/" + srcPath;
        return 'src="' + vsCodePath + '"';
      });
      return newContent
    }
  }
  return token.content;
}

export default async function activate(
  context: vscode.ExtensionContext,
  foamPromise: Promise<Foam>
) {
  const foam = await foamPromise;

  return {
    extendMarkdownIt: (md: markdownit) => {
      md.renderer.rules.html_inline = htmlRule;

      return [
        markdownItWikilinkEmbed,
        markdownItFoamTags,
        markdownItWikilinkNavigation,
        markdownItRemoveLinkReferences,
      ].reduce(
        (acc, extension) =>
          extension(acc, foam.workspace, foam.services.parser),
        md
      );
    },
  };
}
