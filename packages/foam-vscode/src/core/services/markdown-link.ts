import { ResourceLink } from '../model/note';
import { TextEdit } from './text-edit';
import { getFoamVsCodeConfig } from '../../services/config';

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
        const wikiLinkOrder = getFoamVsCodeConfig('wikilinks.order');
        if (wikiLinkOrder === 'alias-last') {
          const [, target, section, alias] = this.wikilinkRegex.exec(
            link.rawText
          );
          return {
            target: target?.replace(/\\/g, '') ?? '',
            section: section ?? '',
            alias: alias ?? '',
          };
        }
        if (wikiLinkOrder === 'alias-first') {
          // use Gollum-style syntact
          const [, alias, target, section] = this.wikilinkRegex2.exec(
            link.rawText
          );
          if ((target ?? '') === '') {
            return {
              target: alias?.replace(/\\/g, '') ?? '',
              section: section ?? '',
              alias: '',
            };
          } else {
            return {
              target: target?.replace(/\\/g, '') ?? '',
              section: section ?? '',
              alias: alias ?? '',
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
