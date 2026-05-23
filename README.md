# The Vault Website

Dev website for The Vault Antiques & Decor.

## Preview Without VS Code

Double-click:

```text
preview-website.bat
```

Or run this from the website folder:

```powershell
node preview-server.js
```

Then open:

```text
http://localhost:8080
```

Use a local server for previewing because the homepage and products page read `data/inventory.json`.
