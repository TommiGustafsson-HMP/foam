import { ResourceLink } from '../model/note';
import { TextEdit } from './text-edit';
import { getFoamVsCodeConfig } from '../../services/config';
import { isPromise } from 'util/types';

export abstract class MarkdownLink {
  private static wikilinkRegex = new RegExp(
    /\[\[([^#|]+)?#?([^|]+)?\|?(.*)?\]\]/
  );
  private static wikilinkRegex2 = new RegExp(
    /\[\[\s*([^|\]]+)\s*\|?\s*([^#\]]+)?#?([^\]]*)?\s*\]\]/
  );
  private static directLinkRegex = new RegExp(
    /\[(.*)\]\(<?([^#>]*)?#?([^\]>]+)?>?\)/
  );

  public static analyzeLink(link: ResourceLink) {
    try {
      if (link.type === 'wikilink') {
        const wikiLinkSyntax = getFoamVsCodeConfig('wikilinks.syntax');
        if (wikiLinkSyntax === 'mediawiki') {
          const [, target, section, alias] = this.wikilinkRegex.exec(
            link.rawText
          );
          return {
            target: target?.replace(/\\/g, '') ?? '',
            section: section ?? '',
            alias: alias ?? '',
          };
        }
        if (wikiLinkSyntax === 'gollum') {
          // use Gollum-style syntact
          let [, alias, target, section] = this.wikilinkRegex2.exec(
            link.rawText
          );

          let isRoot = false;

          if (alias && alias.startsWith('/')) {
            alias = alias.substring(1);
            isRoot = true;
          } else if (alias && alias.startsWith('../')) {
            alias = alias.substring(3);
            isRoot = true;
          }

          if (target && target.startsWith('/')) {
            target = target.substring(1);
            isRoot = true;
          } else if (target && target.startsWith('../')) {
            target = target.substring(3);
            isRoot = true;
          }

          if ((target ?? '') === '') {
            return {
              target: alias?.replace(/\\/g, '') ?? '',
              section: section ?? '',
              alias: '',
              isRoot: isRoot
            };
          } else {
            return {
              target: target?.replace(/\\/g, '') ?? '',
              section: section ?? '',
              alias: alias ?? '',
              isRoot: isRoot
            };
          }
        }
      }
      if (link.type === 'link') {
        const [, alias, target, section] = this.directLinkRegex.exec(
          link.rawText
        );
        return {
          target: target ?? '',
          section: section ?? '',
          alias: alias ?? '',
          isRoot: false
        };
      }
      throw new Error(`Link of type ${link.type} is not supported`);
    } catch (e) {
      throw new Error(`Couldn't parse link ${link.rawText} - ${e}`);
    }
  }

  public static createUpdateLinkEdit(
    link: ResourceLink,
    delta: {
      target?: string;
      section?: string;
      alias?: string;
      type?: 'wikilink' | 'link';
      isEmbed?: boolean;
    }
  ): TextEdit {
    const { target, section, alias } = MarkdownLink.analyzeLink(link);
    const newTarget = delta.target ?? target;
    const newSection = delta.section ?? section ?? '';
    const newAlias = delta.alias ?? alias ?? '';
    const sectionDivider = newSection ? '#' : '';
    const aliasDivider = newAlias ? '|' : '';
    const embed = delta.isEmbed ?? link.isEmbed ? '!' : '';
    const type = delta.type ?? link.type;
    if (type === 'wikilink') {
      return {
        newText: `${embed}[[${newTarget}${sectionDivider}${newSection}${aliasDivider}${newAlias}]]`,
        range: link.range,
      };
    }
    if (type === 'link') {
      const defaultAlias = () => {
        return `${newTarget}${sectionDivider}${newSection}`;
      };
      const useAngles =
        newTarget.indexOf(' ') > 0 || newSection.indexOf(' ') > 0;
      return {
        newText: `${embed}[${newAlias ? newAlias : defaultAlias()}](${
          useAngles ? '<' : ''
        }${newTarget}${sectionDivider}${newSection}${useAngles ? '>' : ''})`,
        range: link.range,
      };
    }
    throw new Error(`Unexpected state: link of type ${type} is not supported`);
  }
}
