## HowTo

1.  Client and Server require self signed certificates (place into each ssl/_ folder with the name localhost._)

2.  In each folder install dependencies via `npm i`

3.  Run chat server via `node ./gaze-chat-server.js`

4.  Run chat client via (only one instance required) `npm run dev`

5.  Open chat clients in Chrome (:8080)

6.  Each client requires a local raw gaze data source via Socket.IO (default on port :4000) and expects JSON with the following format `{ TS: [INT], X: [INT], Y: [INT]}`
