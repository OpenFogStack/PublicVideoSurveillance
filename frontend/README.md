# frontend

> Frontend for fog computing project 2018

## CodeStyle / Linting / Formatting

ESLint and prettier are used for formatting and linting.

`yarn run lint` runs eslint and shows all violations / problems
`yarn run lint-fix` tries to autofix problems / violations if possible

If you use [VSCode](https://code.visualstudio.com/) you can use the settings from
`vscode-settings.json` as User or Workspace Settings (required vscode plugins are listed
in the json file). Those settings and plugins enable formatting on save and autocompletion.

## Build Setup

```bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).
