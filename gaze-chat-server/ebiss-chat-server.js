process.title = "ebiss_GazeChatServer";

// Setup logging
var l = require("tracer").colorConsole({
    level: "debug",
    format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
    dateformat: "HH:MM:ss.L"
});

// Setup Server
var https = require("https");
var fs = require("fs");
var options = {
    key: fs.readFileSync("ssl/localhost.key"),
    cert: fs.readFileSync("ssl/localhost.cert")
};
var port = process.env.PORT || 3003;
var server = https.createServer(options).listen(port);
var io = require("socket.io")(server);

server.listen(port, function() {
    l.info("Server listening at port %d", port);
});

// Avatar folder
var clientPath = "../gaze-chat-client";

// User colors (are unique and thus provided by the server as a global instance)
var colors = [
    {
        hex: "#20b35f",
        name: "Light Sea Green",
        inUse: false
    },
    {
        hex: "#4682B4",
        name: "Steel Blue",
        inUse: false
    },
    {
        hex: "#FFA07A",
        name: "Light Salmon",
        inUse: false
    },
    {
        hex: "#CD5C5C",
        name: "Indian Red",
        inUse: false
    },
    {
        hex: "#CD5C5C",
        name: "Indian Red",
        inUse: false
    },
    {
        hex: "#808080",
        name: "Grey",
        inUse: false
    }
];

// No database, just store users and chat messages as long as the server is running
var userList = {};
var chatMessages = [];
var messageIDcounter = 0;
var userIDcounter = 0;

// Send available colors to the connected users
function sendColorPalette() {
    io.emit("fetch color palette", {
        colors: colors.filter(c => !c.inUse)
    });
}

io.on("connection", function(socket) {
    // Handle incoming connection
    l.info("Socket %s connected as clientType %s", socket.id, socket.handshake.query.clientType);
    socket.clientType = socket.handshake.query.clientType;
    var addedUser = false;
    io.emit("user list", userList);

    // re-send color palette if requested
    socket.on("fetch color palette", function(data) {
        sendColorPalette();
    });

    // Handle webcam photo upload (info: photos are not automatically deleted)
    socket.on("upload photo", function(data, callback) {
        var fileName = "webcam_" + new Date().getTime();
        var base64Data = data.photo.replace(/^data:image\/png;base64,/, "");
        require("fs").writeFile(clientPath + "/static/avatars/" + fileName + ".png", base64Data, "base64", err => {
            if (err) {
                l.error("Couldnt write webcam photo to file", err);
            } else {
                callback(fileName);
            }
        });
    });

    // Handle user registration
    socket.on("add user", function(data) {
        if (addedUser) return;

        // Check if this user is reconnecting
        var reconnectingUserID = -1;
        for (var u in userList) {
            if (userList[u].username == data.username) {
                l.info(socket.id + " is reconnecting...");
                reconnectingUserID = u;
                break;
            }
        }

        socket.username = data.username;
        socket.picture = data.picture;
        socket.color = data.color;

        // Is a new user
        if (reconnectingUserID == -1) {
            socket.uid = ++userIDcounter;

            userList[socket.uid] = {
                uid: socket.uid,
                socketID: socket.id,
                username: socket.username,
                picture: socket.picture,
                color: socket.color
            };

            // Reserve color for this user
            for (var key in colors) {
                if (colors[key].hex == socket.color) {
                    colors[key].inUse = true;
                }
            }
            sendColorPalette();
            l.info(socket.id + " connected. UID: " + socket.uid + ". Username: " + socket.username);
        }
        // Reconnecting user, restore
        else {
            socket.uid = userList[reconnectingUserID].uid;
            userList[reconnectingUserID].socketID = socket.id; // SocketID will be different, update
            l.info(socket.id + " re-connected. UID: " + socket.uid + ". Username: " + socket.username);
        }

        // Notify user about the assigned UID
        addedUser = true;
        socket.emit("login", {
            uid: socket.uid
        });

        // Update all users
        io.emit("user list", userList);
        l.info("Current userList:", userList);
    });

    // Handle sending a new message
    socket.on("send message", function(text) {
        if (!addedUser) return;
        var msg = {
            serverTS: Date.now(),
            mid: ++messageIDcounter,
            uid: socket.uid,
            text: text.replace(/ +(?= )/g, "")
        };
        l.info("Chat Message (UID: %d): %s", msg.uid, msg.text);
        io.emit("new message", msg);
        chatMessages[msg.mid] = msg;
    });

    // Handle messages gaze state changes
    socket.on("change message gaze state", function(data) {
        if (!addedUser) return;
        socket.broadcast.emit("change message gaze state", data);
    });

    // Handle is-typing event
    socket.on("is typing", function() {
        if (!addedUser) return;

        socket.broadcast.emit("is typing", {
            uid: socket.uid
        });
    });

    // Handle is-reading event
    socket.on("is reading", function(data) {
        if (!addedUser) return;

        socket.broadcast.emit("is reading", data);
    });

    // Handle user disconnects
    socket.on("disconnect", function() {
        io.emit("user list", userList);
        l.warn(socket.id + " disconnected:", userList[socket.uid] || "was not in userList");
    });
});
