# Welcome to your Lovable project

## World map data

- Source: https://github.com/topojson/world-atlas
- [TOpoJSON format specification](https://github.com/topojson/topojson-specification/blob/master/README.md#21-topology-objects)
- Countries with multi polygons in topojson:
  - Fiji
  - Canada
  - United States of America
  - Papua New Guinea
  - Indonesia
  - Argentina
  - Chile
  - Russia
  - Bahamas
  - Norway
  - France
  - Angola
  - Oman
  - Vanuatu
  - North Korea
  - Greece
  - Turkey
  - Solomon Is.
  - New Zealand
  - Australia
  - China
  - Italy
  - Denmark
  - United Kingdom
  - Azerbaijan
  - Philippines
  - Malaysia
  - Japan
  - Antarctica

## Drawing world map

[Drawing a 2D map has one technical annoyance: you need to split the map ±180° longitude (antimeridian) to avoid diagonal path artifact across the Pacific](https://observablehq.com/@d3/antimeridian-cutting). This is because the globe is spherical while the display is planar. Use D3’s antimeridian cutting: Project with d3.geoEquirectangular() and render via d3.geoPath(), which automatically breaks geometries at the dateline for you

## Project info

**URL**: https://lovable.dev/projects/6e8d0869-8e57-49fc-b002-271e99d57f32

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6e8d0869-8e57-49fc-b002-271e99d57f32) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

| Layer                   | Tool / Library                       |
| ----------------------- | ------------------------------------ |
| **Framework**           | React                                |
| **Build Tool**          | Vite                                 |
| **Routing**             | React Router DOM                     |
| **Styling**             | Tailwind CSS                         |
| **UI Component System** | shadcn/ui + Radix UI                 |
| **State & Forms**       | React Hook Form, TanStack Query, Zod |
| **Charts / Visuals**    | Recharts, canvas-confetti            |
| **Language**            | TypeScript                           |

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6e8d0869-8e57-49fc-b002-271e99d57f32) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
