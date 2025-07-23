# Foam for Gollum

Foam for Gollum is a fork of [Foam](https://github.com/foambubble/foam/), which adds support for Gollum-style wikilinks: `[[Alias|Page Name]]`.

You need to enable Gollum-style wikilinks with the following setting in Visual Studio Code:

```
"foam.wikilinks.order": "alias-first"
```

It's best to add the above setting to workspace settings in the case you have multiple repositories using a mix of `alias-first` and `alias-last` notations.

Please refer to [Foam documentation](https://github.com/foambubble/foam/) for the full description of features.
