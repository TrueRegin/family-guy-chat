const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { icons, iconNames, disconnectMessages } = require("./static");

app.set("view engine", "pug");
app.set("views", "pages");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

io.on("connection", (socket) => {
    const iconIndex = Math.floor(Math.random() * 5);
    const iconUrl = "/icons/" + icons[iconIndex] + ".png";
    const username = iconNames[iconIndex];
    // const username = `${iconName}` // #${Math.floor(Math.random() * 1000000)}

    socket.username = username;
    socket.iconIndex = iconIndex;
    socket.iconUrl = iconUrl;

    socket.on("send_message", (data) => {
        const message = data.message;
        if(message.trim() !== "") {
            const returnMessage = {
                message,
                author: socket.username,
                iconUrl: socket.iconUrl,
            };
            socket.broadcast.emit("send_message", returnMessage);
            socket.emit("my_message", returnMessage);
            socket.emit("clear_message");
        } else {
            socket.emit("send_error", {message: "ERROR --> You can not send an empty message!"});
        }
    });

    socket.on("disconnect", () => {
        io.sockets.emit("disconnect_message", {
            message: disconnectMessages[socket.iconIndex],
        });
    });
});

server.listen(3000, "localhost");
