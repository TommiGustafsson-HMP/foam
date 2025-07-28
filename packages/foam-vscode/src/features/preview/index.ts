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
  
  let startIndex = 0;
  let returnContent: string = "";
  while (true) {
    let imgTagIndex = token.content.indexOf('<img ', startIndex);
    if (imgTagIndex >= startIndex) {
      const srcIndex = token.content.indexOf('src="', imgTagIndex);
      const hasRootSrc = token.content.substring(srcIndex + 5, srcIndex + 6) === '/';
      const endingQuoteIndex = token.content.indexOf('"', srcIndex + 6);
      const endingTagIndex = token.content.indexOf('>', endingQuoteIndex + 1);
      let newContent = "";
      if(hasRootSrc) {
        const src = token.content.substring(srcIndex + 5, endingQuoteIndex);
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const srcPath = path.join(workspaceFolder.uri.fsPath, src).replace(/\\/g, "/");
        const vsCodePath = "https://file+.vscode-resource.vscode-cdn.net/" + srcPath;
        newContent = token.content.substring(startIndex, srcIndex + 5) + vsCodePath
          + token.content.substring(endingQuoteIndex, endingTagIndex + 1);
      } else {
        newContent = token.content.substring(startIndex, endingTagIndex + 1);
      }
      returnContent += newContent
      startIndex = endingTagIndex + 1;
    } else {
      break;
    }
  }

  if(returnContent.length > 0) {
    return returnContent;
  } else {
    return token.content;
  }
}

export default async function activate(
  context: vscode.ExtensionContext,
  foamPromise: Promise<Foam>
) {
  const foam = await foamPromise;

  return {
    extendMarkdownIt: (md: markdownit) => {
      md.renderer.rules.html_inline = htmlRule;
      md.renderer.rules.html_block = htmlRule;

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
