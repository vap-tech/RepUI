# Fonts

RepUI 0.6.1 does not duplicate development font files inside each release.

Expected workspace layout:

```text
work/
├── fonts/
│   ├── manrope.woff2
│   └── roboto-flex.woff2
└── repui-0.6.1-fonts-command-fix/
    └── repui.css
```

The paths are declared in the root `repui.css` as `../fonts/...`.
