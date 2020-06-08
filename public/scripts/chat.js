$(document).ready(() => {
    var io_client = io();
    var socket = io_client.connect("localhost:3000");

    var messageInput = $("#message-input");
    var messageSubmit = $("#message-submit");
    var chat = $("#chat");
    var statusFeedClearAll = $("#feed-clear-all")
    var statusFeed = $("#feed-content");

    messageInput.keypress((e) => {
        if (e.keyCode === 96) {
            sendMessage();
        }
    });

    var currId = 0;

    $(document).on("click", ".feed-item-container", () => {});

    messageSubmit.on("click", () => {
        sendMessage();
    });

    function getId() {
        const id = currId;
        currId += 1;
        return id;
    }

    function sendError(text, id) {
        let errorContainer = document.createElement("div");
        errorContainer.className = "feed-item-container";
        let errorMessage = document.createElement("div");
        errorMessage.setAttribute('data-id', id);
        errorMessage.className = "feed-item feed-error"

        errorMessage.innerHTML = text;

        errorContainer.append(errorMessage);
        statusFeed.append(errorContainer);

        /*
        `<div class='feed-item-container'>
            <div data-id="${id}" class='feed-item feed-error'>${text}</div>
        </div>`
        */

        setTimeout(() => {
            errorContainer.remove();
        }, 8000)
    }

    function sendMessage() {
        if (messageInput.val().trim() !== "") {
            socket.emit("send_message", { message: messageInput.val() });
        } else {
            const validId = getId();
            sendError("ERROR --> You can not send an empty message!");

            // setTimeout(() => {
            //     $(`div[data-id=${validId}`).remove();
            // }, 10000);
        }
    }

    socket.on("my_message", (message) => {
        message.message = message.message.split("\n").join("<br>");

        chat.append(`<div class='chat-item chat-item-style me'>
        <div class='chat-message'>${message.message}</div>
        <div class='chat-user'>
            <div class='chat-author'>${message.author}</div>
            <img class='chat-icon' src='${message.iconUrl}' alt='User's icon'/>
        </div>
        </div>`);
    });

    socket.on("send_message", (message) => {
        message.message = message.message.split("\n").join("<br>");

        chat.append(`<div class='chat-item chat-item-style'>
        <div class='chat-message'>${message.message}</div>
        <div class='chat-user'>
            <div class='chat-author'>${message.author}</div>
            <img class='chat-icon' src='${message.iconUrl}' alt='User's icon'/>
        </div>
        </div>`);
    });

    socket.on("disconnect_message", (message) => {
        chat.append(`<div class='chat-item-style'>${message.message}</div>`);
    });

    socket.on("clear_message", () => {
        messageInput.val("");
    });

    socket.on("send_error", (data) => {
        sendError(data.message);
    });
});
