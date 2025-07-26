# Foam for Gollum

Foam for Gollum is a fork of the [Foam](https://github.com/foambubble/foam/) extension, which adds support for the **wikilink syntax** that is used in [Markdown](https://www.markdownguide.org/) documents in Gollum-based wikis.

[Gollum](https://github.com/gollum/gollum) is a wiki software based on the [Git version control system](https://git-scm.com/). For example, [GitHub](https://github.com/)'s repository wikis are based on Gollum and use its syntax.

**Wikilinks** are page name links in double brackets (`[[Page Name]]`), which are used in wiki pages to link to other wiki pages. The main differences of the Gollum-style wikilinks to the standard wikilink syntax of [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki) are:

- When a wikilink has an alias, the alias comes first: `[[Alias|Page Name]]`
- Section headings after a hash (`#`) have a different syntax.
- Subfolders are relative to the current document folder and not to the root of the wiki.

## New Settings

The new settings in this extension and their defaults are:

```
"foam.wikilinks.syntax": "gollum",
"foam.wikilinks.case-insensitive": true
```

The possible values for `"foam.wikilinks.syntax"` are `"gollum"` and `"mediawiki"`.

You don't need to specify these settings in Visual Studio Code's settings, if the defaults work for you.

It's best to add the above setting to workspace settings in the case you have multiple repositories with different notations. For repositories using the MediaWiki syntax `[[Page Name|Alias]]`, you need to specify `"foam.wikilinks.syntax": "mediawiki"`.

## New Features in This Extension

### 1. Gollum-Style Wikilinks

This extension adds support for the following Gollum-style wikilink features, when `"foam.wikilinks.syntax"` setting is `"gollum"`.

#### 1.1. Alias First in Wikilinks

Wikilinks with an alias follow the convention `[[Alias|Page Name]]`.

#### 1.2. Section Heading Anchors Follow Gollum Notation

Anchors for section headings (`#` + the section heading name in the wikilink) use the Gollum format, which is the following:

- The text is converted to lower case.
- Special characters are removed.
- Spaces are replaced with dashes.

For example, if you have a section heading `4. My Test Heading`, you should use `#4-my-test-heading` as the anchor in the wikilink.

#### 1.3. Gollum-Style Subdirectory Support

In Gollum, wikilinks are **relative to the current document** and not to the root of the wiki. This extension adds support for the following notations in wikilinks:

| Notation | Description |
| :------- | :---------- |
| `[[/My page]]` | A starting slash `/` links to a document in the root directory. |
| `[[../My page]]` | `../` links to a document in the parent directory. |
| `[[My subdir/My page]]` | You can add subdirectory name and a slash to link to a *subdirectory under the current document directory*. |
| `[[/My subdir/My page]]` | You can add a slash, a subdirectory name, and a slash to link to a *subdirectory under the root of the wiki*. |

Multiple levels of subdirectories are supported.

### 2. Case-Insensitive Wikilinks

When `"foam.wikilinks.case-insensitive"` setting is `true`, wikilink parsing is case-insensitive.

#### Example

- `[[my page]]` links to `My page.md` but shows as `my page` in the preview.

## Foam Extension Features

Please refer to [Foam documentation](https://github.com/foambubble/foam/) for the full description of the features of the Foam extension.
