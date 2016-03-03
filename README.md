Feathers
==================
> The marketing site for FeathersJS

## Getting Started

1. Install nodejs and npm
2. Install Gulp CLI by running `npm install -g gulp-cli` 
3. run `npm install`
4. run `gulp watch` go to [localhost:8080/](http://localhost:8080/) and start editing content. Your content will automatically be rebuilt when things change.

## Building

Simply run `gulp` to build the site.

## Deploying
The site currently gets deployed to Github Pages. In order to do this simple run `npm run deploy`. This will clean out any old files, rebuild the site with the production config, and push it to the `gh-pages` branch.

## Structure

### `content/`

Contains the raw html and markdown pages for the site. These get compiled with the `layouts` and moved to the `build/` directory.

### `assets/`

This is where all the static assets live that end up getting compiled and/or copied to the `build/` directory. This includes:

- scripts
- images
- styles
- templates/layouts
- fonts
- any other static files

### `config/`

This directory holds the config values for production and development environments.

### `build/`

These are all the files that get deployed to the `gh-pages` branch.
