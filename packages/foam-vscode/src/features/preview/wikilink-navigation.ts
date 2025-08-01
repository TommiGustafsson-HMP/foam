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

export const markdownItWikilinkNavigation = (
  md: markdownit,
  workspace: FoamWorkspace
) => {
  return md.use(markdownItRegex, {
    name: 'connect-wikilinks',
    regex: /(?=[^!])\[\[([^[\]]+?)\]\]/,
    replace: (wikilink: string) => {
      try {
        const { target, section, alias } = MarkdownLink.analyzeLink({
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
          return getResourceLink(section, linkSection, label);
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
          resourceLabel
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

const getResourceLink = (title: string, link: string, label: string) =>
  `<a class='foam-note-link' title='${title}' href='${link}' data-href='${link}'>${label}</a>`;

export default markdownItWikilinkNavigation;
