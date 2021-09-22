# About

Simple CMS for maintaining a blog.

I wanted something exclusive and unique to provide a platform for my blog and I also wanted to learn React.
The best way to learn a tech stack is to use it, so I did. My primitive CMS was born.
Basic features include adding/editing/deleting posts and photo galleries. 
Planned features include handling comments and integrating other social media functions to allow reader engagement.

This project uses the MERN stack (MongoDB, ExpressJS, ReactJS, NodeJS).

# Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running on local

### Node API + React on single server
This option is good for testing the currently deployed system and the routing system itself.

On windows, run `start.bat` in a command prompt to run the frontend+backend served on localhost:4000. The React app is served from the `client/build` directory.
To execute commands individually, see steps below.

```
cd mernblog
npm install
npm run-script win-local
cd client/
npm install
npm run-script build
```
Although the Node server will restart automatically on code and file changes, the React app needs to be rebuilt with `npm run-script build` after any code changes.

### Node API + React on separate servers

Run the Node API server on `localhost:4000` and the React dev server on `localhost:3000`.
```
cd mernblog
npm install
npm run-script win-local
cd client/
npm install
npm start
```
Both servers restart automatically on code change to make changes visible on the site.

## Component dependency analysis

Draw a basic dependency graph of the React components used.
This does not include external libraries in the output graph.

`. .drawdeps`