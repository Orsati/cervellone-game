# Agent Instructions for "Quizzone" Project

## Goal
This agent's purpose is to set up the complete development environment for the Quizzone application, run all services, and verify that they have started correctly.

## Setup Steps
From the root directory of the repository, run the following commands in order:

1.  **Install root dependencies:**
    ```bash
    npm install
    ```
2.  **Install dependencies for all workspaces:**
    *First, add this script to the root `package.json` file:*
    ```json
    "scripts": {
      "install-all": "npm install --prefix game-server && npm install --prefix frontend-player && npm install --prefix frontend-projector && npm install --prefix admin-panel",
      "start": "node manager.js",
      "dev-admin": "npm run dev --prefix admin-panel",
      "dev": "concurrently \"npm:start\" \"npm:dev-admin\""
    }
    ```
    *Then, the command to run is:*
    ```bash
    npm run install-all
    ```

## Run Command
To start the entire application ecosystem (manager and admin panel), run this command from the root directory:
```bash
npm run dev
