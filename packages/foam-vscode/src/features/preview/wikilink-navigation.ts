/*global markdownit:readonly*/

import markdownItRegex from 'markdown-it-regex';
import * as vscode from 'vscode';
import { FoamWorkspace } from '../../core/model/workspace';
import { Logger } from '../../core/utils/log';
import { toVsCodeUri } from '../../utils/vsc-utils';
import { MarkdownLink } from '../../core/services/markdown-link';
import { Range } from '../../core/model/range';
import { isEmpty } from 'lodash';
import { toSlug } from '../../utils/slug';
import { isNone } from '../../core/utils';
import { getFoamVsCodeConfig } from '../../services/config';
import { getResourceSubDir } from  '../../core/services/markdown-provider';

export const markdownItWikilinkNavigation = (
  md: markdownit,
  workspace: FoamWorkspace
) => {
  return md.use(markdownItRegex, {
    name: 'connect-wikilinks',
    regex: /(?=[^!])\[\[([^[\]]+?)\]\]/,
    replace: (wikilink: string) => {
      try {
        const { target, section, alias, isRoot, parentCount, imageProperties, linkType } = MarkdownLink.analyzeLink({
          rawText: '[[' + wikilink + ']]',
          type: 'wikilink',
          range: Range.create(0, 0),
          isEmbed: false,
        });

        const formattedSection = section ? `#${section}` : '';
        const linkSection = section ? `#${toSlug(section)}` : '';
        const label = isEmpty(alias) ? `${target}${formattedSection}` : alias;

        // [[#section]] links
        if (target.length === 0) {
          // we don't have a good way to check if the section exists within the
          // open file, so we just create a regular link for it
          return getResourceLink(section, linkSection, label, linkType, isRoot, imageProperties);
        }

        const resource = workspace.find(target);
        if (isNone(resource)) {
          return getPlaceholderLink(label);
        }

        const wikiLinkCaseInsensitive = getFoamVsCodeConfig('wikilinks.case-insensitive');
        let resourceTitle = resource.title;
        if (wikiLinkCaseInsensitive) {
          const targetLastIndexOfSlash = target.lastIndexOf('/');
          const targetWithoutPath = targetLastIndexOfSlash >= 0 ?
            target.substring(targetLastIndexOfSlash + 1) :
            target;
          if (resource.title.toLowerCase() === targetWithoutPath.toLowerCase()) {
            resourceTitle = targetWithoutPath;
          }
        }

        const resourceLabel = isEmpty(alias) ? `${resourceTitle}${formattedSection}` : alias;
        const resourceLink = `/${vscode.workspace.asRelativePath(
          toVsCodeUri(resource.uri),
          false
        )}`;
        return getResourceLink(
          `${resourceTitle}${formattedSection}`,
          `${resourceLink}${linkSection}`,
          resourceLabel,
          linkType,
          isRoot,
          imageProperties
        );
      } catch (e) {
        Logger.error(
          `Error while creating link for [[${wikilink}]] in Preview panel`,
          e
        );
        return getPlaceholderLink(wikilink);
      }
    },
  });
};

const getPlaceholderLink = (content: string) =>
  `<a class='foam-placeholder-link' title="Link to non-existing resource" href="javascript:void(0);">${content}</a>`;

export function getResourceLink (title: string, link: string, label: string, linkType: string, isRoot: boolean, imageProperties: string): string {
  if (linkType === 'image') {
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const vsCodePath = "https://file+.vscode-resource.vscode-cdn.net" + workspaceFolder.uri.path;
    const finalLink = vsCodePath + (isRoot ? link : link);
    const encodedLink = encodeURI(finalLink);
    const parsedImageProperties = parseImageProperties(imageProperties);
    let htmlAttributes = '';
    let styles = '';
    for (const [key, value] of Object.entries(parsedImageProperties)) {
      if (key === 'height') {
        styles += "max-height:" + value + ";";
      } else if (key === 'width') {
        styles += "max-width:" + value + ";";
      } else if (key === "alt") {
        htmlAttributes += 'alt="' + value + '" ';
      } else if (key === "frame") {
        htmlAttributes += 'class="' + value + '" ';
      } else if (key === "align") {
        htmlAttributes += 'align="' + value + '" ';
      } else if (key === "float") {
        styles += 'float:' + value + ';';
      }
    }
    if(styles.length > 0) {
      htmlAttributes += 'style="' + styles + '"';
    }
    return `<img class="foam-note-image" alt="${title}" src="${encodedLink}" ${htmlAttributes} />`;
  } else {
    return `<a class='foam-note-link' title="${title}" href="${link}" data-href="${link}">${label}</a>`;
  }
}

export function parseImageProperties(imageProperties: string) {
  let returnValue = {};

  if ((imageProperties ?? '') === '') {
    return returnValue;
  }

  let splitProperties = imageProperties.split(/\s*\,\s*/);
  for (const prop of splitProperties) {
    let splitProp = prop.split(/\s*\=\s*/);
    if(splitProp.length == 2) {
      returnValue[splitProp[0].trim()] = splitProp[1].trim();
    }
  }

  return returnValue;
}

export default markdownItWikilinkNavigation;

