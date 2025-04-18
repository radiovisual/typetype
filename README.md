# typetype

> A vibe-coded, real-time typing game with WebGL particle effects.

> [!INFO]
> This game was 100% "vibe coded" with [OpenAI's Codex CLI](https://github.com/openai/codex). I did not write any of the code in this repo.

![typetype logo](/media/logo.png)

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Development

Start the development server with live reload:

```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### Building

To build the project for production:

```bash
npm run build
```

### Deploy to GitHub Pages

This project includes deployment scripts using the `gh-pages` package.

To publish to GitHub Pages:

```bash
npm run deploy
```

This will build the project and publish the contents of the `dist/` directory to the `gh-pages` branch.

On GitHub, go to **Settings > Pages**, set **Source** to the `gh-pages` branch, and save.

Your game will be available at:

```
https://<USERNAME>.github.io/<REPO-NAME>/
```

Replace `<USERNAME>` with your GitHub username and `<REPO-NAME>` with the repository name.
