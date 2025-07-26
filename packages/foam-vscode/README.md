# Foam for Gollum

Foam for Gollum is a fork of [Foam](https://github.com/foambubble/foam/), which adds support for Gollum-style wikilinks `[[Alias|Page Name]]`.

## New Settings

These are new settings and their defaults:

```
"foam.wikilinks.syntax": "gollum", // possible values: "gollum" and "mediawiki"
"foam.wikilinks.case-insensitive": true
```

You don't need to specify them in Visual Studio Code settings, if the defaults work for you.

It's best to add the above setting to workspace settings in the case you have multiple repositories with different notations. For repositories using the MediaWiki syntax `[[Page Name|Alias]]`, you need to specify `"foam.wikilinks.syntax": "mediawiki"`.

## New Features in This Extension

This extension adds the support following Gollum features, when `"foam.wikilinks.syntax"` is `"gollum"`.

### Alias First in Wikilinks

Wikilinks with an alias follow the convention `[[Alias|Page Name]]`.

### Anchors Follow Gollum Notation

Anchors for section headings (`#Section Name` in the wikilink) use the Gollum format, which is URL encoded.

For example, `#4. My Test Heading` renders as `#4-my-test-heading`.

### Case-Insensitive Wikilinks

You can write `[[my page]]` and it links to `My page.md` but shows as `my page` in the preview.

### Gollum-Style Subdirectory Support

In Gollum, wikilinks are **relative to the current document** and not to the root of the wiki. This extension adds support for the following notations in wikilinks:

| Notation | Description |
| :------- | :---------- |
| `[[/My page]]` | A starting slash `/` links to a document in the root directory. |
| `[[../My page]]` | `../` links to a document in the parent directory. |
| `[[My subdir/My page]]` | You can add subdirectory name and a slash to link to a *subdirectory under the current document directory*. |
| `[[/My subdir/My page]]` | You can add a slash, a subdirectory name, and a slash to link to a *subdirectory under the root of the wiki*. |

Multiple levels of subdirectories are supported.

## Foam Features

Please refer to [Foam documentation](https://github.com/foambubble/foam/) for the full description of features.
