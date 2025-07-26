# Change Log

All notable changes to the "foam-vscode-gollum" extension will be documented in this file.

## [1.0.8] - 2025-07-26

- Updated README.md.
- A small performance fix.

## [1.0.7] - 2025-07-26

- Added proper support for case insensitivity in previews.

## [1.0.6] - 2025-07-26

- Added support for wikilinks with multiple parent directories, such as `../../Lawful`.

## [1.0.5] - 2025-07-25

- Fix relative links with subdirectories in documents in subdirectories.

## [1.0.4] - 2025-07-25

- Changed setting name to `foam.wikilinks.syntax` with `gollum` and `mediawiki` options.
- Added `foam.wikilinks.case-insensitive` setting with `true` and `false`.
- Support for recognizing the need for `/` in wikilinks referring to document root items.

## [1.0.3] - 2025-07-24

- Added support for lowercase wikilinks.
- Added support for Gollum-style section headers.

## [1.0.2] - 2025-07-24

- Added support for links starting with `/` and `../`.

## [1.0.1] - 2025-07-23

- Updated README.MD.
- Updated CHANGELOG.MD.
- Updated the extension icon.

## [1.0.0] - 2025-07-23

- Forked Foam 0.26.12.
- Added support for Gollum-style wikilinks `[[Alias|Page Name]]`.
- Added `foam.wikilinks.order` setting with `alias-first` and `alias-last` options.
