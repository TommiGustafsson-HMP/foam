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

  private static convertGollumTarget(target: string) {
    let isRoot = false;
    let parentCount = 0;

    if (target.startsWith('/')) {
      target = target.substring(1);
      isRoot = true;
    }
    if (target.startsWith('./')) {
      target = target.substring(2);
    }
    while (target.startsWith('../')) {
      target = target.substring(3);
      parentCount++;
    }
    return {
      target: target,
      isRoot: isRoot,
      parentCount: parentCount
    };
  }

  public static analyzeLink(link: ResourceLink) {
    try {
      const wikiLinkSyntax = getFoamVsCodeConfig('wikilinks.syntax');
      if (link.type === 'wikilink') {
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

          if ((target ?? '') === '') {
              target = alias;
              alias = '';
          }

          let {target: target2, isRoot, parentCount} = this.convertGollumTarget (target);

          return {
            target: target2?.replace(/\\/g, '') ?? '',
            section: section ?? '',
            alias: alias ?? '',
            isRoot: isRoot,
            parentCount: parentCount
          };
        }
      }
      if (link.type === 'link') {
        let [, alias, target, section] = this.directLinkRegex.exec(
          link.rawText
        );

        let isRoot = false;
        let parentCount = 0;

        if (wikiLinkSyntax === 'gollum') {
          const retValue = this.convertGollumTarget(target);
          target = retValue.target;
          isRoot = retValue.isRoot;
          parentCount = retValue.parentCount;
          target = decodeURI(target);
        }

        return {
          target: target ?? '',
          section: section ?? '',
          alias: alias ?? '',
          isRoot: isRoot,
          parentCount: parentCount
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
