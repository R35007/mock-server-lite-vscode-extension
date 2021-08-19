# Mock Server Lite[](#mock-server-lite) [![](https://img.shields.io/npm/v/@r35007/mock-server-lite)](https://img.shields.io/npm/l/@r35007/mock-server?color=blue) [![](https://img.shields.io/npm/types/@r35007/mock-server)](https://img.shields.io/npm/types/@r35007/mock-server)

Get a full REST API with **zero coding** in **less than 30 seconds** (seriously)

Created with <3 for front-end developers who need a quick back-end for prototyping and mocking.

This Extension is built upon node package `@r35007/mock-server`.

This is a liter version of [Mock Server](https://github.com/R35007/mock-server)

## Table of contents

- [Getting started](#getting-started)
- [Commands](#commands)
  - [Start Server](#start-server)
  - [Stop Server](#stop-server)
  - [Get Db Snapshot](#get-db-snapshot)
  - [Transform to Mock Server Db](#transform-to-mock-server-db)
  - [Generate Mock Files](#generate-mock-files)
- [Settings](#settings)
  - [Set Custom Port](#set-custom-port)
  - [Set Custom host](#set-custom-host)
  - [Set Base Path](#set-base-path)
  - [Set Db Id](#set-db-id)
  - [Set Data Paths](#set-data-paths)
    - [DB](#db)
    - [Middleware](#middleware)
    - [Injectors](#injectors)
    - [Route Rewriters](#route-rewriters)
    - [Static File Server](#static-file-server)
- [Documentation](#documentation)
- [Author](#author)
- [License](#license)

## Getting started

- Install the Extension.
- Right click on the workspace folder and select `Generate Mock Files` from the context.
- From Command Palette (`(Ctrl/Cmd)+Shift+P`) type mock and select `MockServer: Start Server` (`Alt+Enter`)
- To view the List of resources go to Command `MockServer: Home Page`

![Home Page](https://github.com/R35007/Mock-Server/blob/main/src/img/VSCode_Extension.gif?raw=true)

## Commands

### `Start Server`

Mock Server can be started in three ways.

- From Command Palette (`(Ctrl/Cmd)+Shift+P`) type mock and select `MockServer: Start Server`
- Use `Alt+Enter` shortcut to start or restart the server.
- Click the `Mock It` icon at the right corner of the statusbar
- Server will automatically will restarted if any changes are made.
- You can also manually restart the server bu giving the same `MockServer: Start Server` Command

### `Stop Server`

- From Command Palette (`(Ctrl/Cmd)+Shift+P`) type mock and select `MockServer: Stop Server`.
- ShortCut using `Shift+Alt+Enter`

### `Get Db Snapshot`

- `MockServer: Get Db Snapshot` Command helps to save the current db data snapshot.

### `Transform to Mock Server Db`

- `MockServer: Transform to Mock Server Db` Command helps to generate a valid routes.
- This also helps to convert the `.har` data to a valid `db.json` file.

### `Generate Mock Files`

- `MockServer: Generate Mock Files` Command helps to generate a sample mock files in the `mock-server.settings.paths.root` folder.
- Alternatively you can also generate mock files by right clicking on the folder and click `Generate Mock Files` command in the context menu.

## Settings

### `Set Custom Port`

- Set a custom port using `mock-server.settings.port` in vscode settings.json.
- Default: `3000`.

### `Set Custom Host`

- Set a custom host using `mock-server.settings.host` in vscode settings.json.
- Default: `localhost`.

### `Set Base Path`

- You can mount the Mock Server on another endpoint using the base url.
- Use `mock-server.settings.base` in vscode settings.json to set a custom base path.
- Alternatively you can also set the base path using the [Route Rewriter](#route-rewriter).

### `Set Db Id`

- `mock-server.settings.id` set database id property (e.g. \_id).
- Default: `id`

### `Set Data Paths`

- `mock-server.settings.paths` sets all the data paths to start the Mock Server.
- Defaults:

```jsonc
{
  "root": "./", // all paths will be relative this path.
  "db": "db.json", // If its a folder path, the server pick all the .json files and run the mock server.
  "middleware": "middleware.js", // path to middlewares. Must be .js type file
  "injectors": "injectors.json", // path to injectors file
  "rewriters": "rewriters.json", // path to rewriters file
  "store": "store.json", // path to store file
  "staticDir": "public", // path to static file server.
}
```

### DB

- Create `db.json`
- Set custom Db path using setting `mock-server.settings.paths.db`.
- This path can be either file path or folder path or also a server path.
- If provided as a folder path, then all the `.json` files will be joined together and starts the server.
- Example 1 : `db.json`.
- Example 2 : `./folder`.
- Example 2 : `https://jsonplaceholder.typicode.com/db`.

### Middleware

- Create `middleware.js`
- Set custom Middleware path using setting `mock-server.settings.paths.middleware`.
- Middlewares must be of a type `.js` file.
- Callback method to generate routes can also be given in this `middleware.js`.
- Example:

`middleware.js`

```js
/* 
  Used in VS Code Mock Server extension
  This method is called only on generating db suing MockServer: Generate Db Command
  It will be called for each entry in a HAR formatted data
  Here you can return your custom route and routeConfig
  `entryCallback` is a reserved word for generating Db 
*/
exports.entryCallback = (entry, routePath, routeConfig) => {
  // your code goes here ...
  return { [routePath]: routeConfig }
};

/* 
  Used in VS Code Mock Server extension
  This method is called only on generating db suing MockServer: Generate Db Command
  It will be called at last of all entry looping.
  Here you can return your custom db
  Whatever you return here will be pasted in the file
  `finalCallback` is a reserved word for generating Db
*/
exports.finalCallback = (data, db) => {
  // your code goes here ...
  return db;
};

/* 
  This is a Express middleware used to call on a specific routes.
  example in db.json
  {
    "/customMiddleware": {
    "_config": true,
    "fetch": "http://jsonplaceholder.typicode.com/users",
    "middlewareNames": [
      "DataWrapper"
    ]
  }
*/

// You can create n number of middlewares like this and can be used in any routes as mentioned in above example.
exports.DataWrapper = (req, res, next) => {
  res.locals.data = {
    status: "Success",
    message: "Retrived Successfully",
    result: res.locals.data
  }
  next();
};

exports.CustomLog = (req, res, next) => {
  console.log(new Date());
  next();
};

// Access store value
exports.GetStoreValue = (req, res, next) => {
  res.locals.data = "The store value is : " + res.locals.store.data;
  next();
};
```

### Injectors

- Create `injectors.json`.
- Set custom Injectors path using `mock-server.settings.paths.injectors`.
- Injectors helps to inject a route config to the routes in the `db.json`.
- Example:

`injectors.json`

```jsonc
[
  {
    "routeToMatch": "/injectors/:id",
    "description": "This description is injected using the injectors by matching the pattern '/injectors/:id'."
  },
  {
    "routeToMatch": "/injectors/1",
    "override": true,
    "mock": "This data is injected using the injectors by matching the pattern '/injectors/1'."
  },
  {
    "routeToMatch": "/injectors/2",
    "override": true,
    "mock": "This data is injected using the injectors by matching the pattern '/injectors/2'."
  },
  {
    "routeToMatch": "/injectors/:id",
    "override": true,
    "exact": true,
    "statusCode": 200,
    "mock": "This data is injected using the injectors by exactly matching the route '/injectors/:id'."
  },
  {
    "routeToMatch": "/(.*)",
    "description": "This Description is injected using the injectors. Set 'Override' flag to true to override the existing config values."
  },
  {
    "routeToMatch": "/(.*)",
    "override": true,
    "middlewareNames": [
      "...",
      "CustomLog"
    ]
  }
]
```

### Route Rewriters

- Create `rewriters.json`.
- Set custom Rewriters path using `mock-server.settings.paths.rewriter`.
- This helps to create a custom route.
- Example:

`rewriters.json`

```jsonc
{
  "/posts/:id/comments": "/fetch/comments/proxy?postId=:id",
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category",
  "/articlesS?id=:id": "/posts/:id"
}
```

To mount on another endpoint you can use `mock-server.settings.base`. Alternatively you can also rewrite the url as follows

```jsonc
{
  "/api/*": "/$1"
}
```

Now you can access resources using /api/

```txt
  /api/posts # → /posts
  /api/posts/1  # → /posts/1
```

### Static File Server

- Create a folder `public` in the project root folder.
- Now when you start the server, all files under this folder will be automatically hosted in the file server.
- Set Custom directory using `mock-server.settings.paths.staticDir`

## **Documentation**

- ReadMe - [https://r35007.github.io/Mock-Server-Lite/](https://r35007.github.io/Mock-Server-Lite/)

## Author

**Sivaraman** - [sendmsg2siva.siva@gmail.com](sendmsg2siva.siva@gmail.com)

- _GitHub_ - [https://github.com/R35007/Mock-Server-Lite](https://github.com/R35007/Mock-Server-Lite)

## License

MIT