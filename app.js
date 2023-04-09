require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

const configuration = new Configuration({
    organization: 'org-2I9LMS95JGRJvd124KDjPVdj',
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.static("public"));

io.on("connection", (socket) => {
    const conversationHistory = [];
    socket.on("sendMessage", async (message, callback) => {
        try {
            conversationHistory.push({ role: "user", content: message });
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: conversationHistory,
            });
            const response = completion.data.choices[0].message.content;
            conversationHistory.push({ role: "assistant", content: response });
            socket.emit("message", response);
            callback();
        } catch (error) {
            console.error(error.toJSON());
            callback("Error: Unable to connect to the chatbot");
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});