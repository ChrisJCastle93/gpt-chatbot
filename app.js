require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { Configuration, OpenAIApi } = require("openai");
const { resolve } = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  organization: "org-2I9LMS95JGRJvd124KDjPVdj",
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

  socket.on("itineraryRequest", async (req, callback) => {
    try {
      // const prompt = `You are a local tour guide in Berlin. ${req.particpants} have asked for you to write an itinerary for them that lasts three hours and includes a visit to the TV Tower. They are interested in ${req.food ? "food" : ""} ${req.food && req.drink ? "and" : ""} ${req.drink ? "drink" : ""} so include that. Write it in bullet points.`;

      // const completion = await openai.createCompletion({
      //   model: "text-davinci-003",
      //   prompt,
      //   max_tokens: 500,
      // });

      // console.log(completion.data.choices[0].text);
      const response = " \n" + "\n" + "• Arrive at Berlin TV Tower \n" + "• Ascend the Tower and enjoy the 360 degree views of Berlin (approx. 45 minutes) \n" + "• Head to Checkpoint Charlie and explore Cold War History (approx. 30 minutes) \n" + "• Have lunch at a local café or restaurant nearby (approx. 45 minutes) \n" + "• Visit Brandenburger Tor and learn about its historical significance (approx. 30 minutes)\n" + "• Finish the tour at the Memorial to the Murdered Jews of Europe (approx. 30 minutes)";
      socket.emit("itineraryResponse", response);

      conversationHistory.push({ role: "assistant", content: response + ". How should we change this itinerary for you?" });

      socket.emit("message", "How should we change this itinerary for you?");

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
