const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, Chat } = require("./chat");

dotenv.config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getRoomOptions() {
  try {
    const response = await axios.get("https://bot9assignement.deno.dev/rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching room options:", error);
    return [];
  }
}

async function bookRoom(roomId, fullName, email, nights) {
  try {
    const response = await axios.post("https://bot9assignement.deno.dev/book", {
      roomId,
      fullName,
      email,
      nights,
    });
    return response.data;
  } catch (error) {
    console.error("Error booking room:", error);
    return null;
  }
}

const systemPrompt = `
You are a hotel booking assistant. Your job is to help users book hotel rooms. 
You should not answer any off-topic questions and should guide the user through the process of booking a room.
The steps include:
1. Greeting the user.
2. Showing available room options.
3. Accepting user selection of a room.
4. Collecting user details (name, email, number of nights).
5. Confirming the booking.
6. if user speeks hindi use hinglish
`;

const context = [{ role: "system", content: systemPrompt }];

let bookingInfo = {};
const functions = [
  {
    name: "getRoomOptions",
    description: "Fetch available room options",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getBookingDetail",
    description: "Get booking details",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "bookRoom",
    description: "Book a room for the user",
    parameters: {
      type: "object",
      properties: {
        roomId: { type: "integer" },
        f_Name: { type: "string" },
        l_Name: { type: "string" },
        email: { type: "string" },
        nights: { type: "integer" },
      },
      required: ["roomId", "f_Name", "l_Name", "email", "nights"],
    },
  },
];

let createdChat;

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  createdChat = await Chat.create({ role: "user", content: message });
  console.log("Chat entry created:", createdChat);
  context.push({ role: "user", content: message });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: context,
      functions: functions,
    });

    //console.log(response);
    let botReply = response?.choices[0]?.message?.content?.trim();
    console.log(response.choices[0].message);
    if (response.choices[0].finish_reason === "function_call") {
      const functionCall = response.choices[0].message.function_call;
      const functionName = functionCall.name;

      if (functionName === "getRoomOptions") {
        const rooms = await getRoomOptions();
        botReply = `Here are the available rooms:<br><br>${rooms
          .map(
            (room) =>
              `Room ID: ${room.id}<br>Name: ${room.name}<br>Price: ${room.price}<br>Description: ${room.description}<br><br>`
          )
          .join("")}`;
      } else if (functionName === "bookRoom") {
        const { roomId, f_Name, l_Name, email, nights } = JSON.parse(
          functionCall.arguments
        );
        const booking = await bookRoom(
          roomId,
          f_Name + " " + l_Name,
          email,
          nights
        );
        bookingInfo = { ...booking };
        botReply = booking
          ? `Booking confirmed! Your booking ID is ${booking.bookingId}.`
          : "There was an error booking the room. Please try again.";
      } else if (functionName === "getBookingDetail") {
        console.log(bookingInfo);
        if (Object.keys(bookingInfo).length !== 0) {
          const reply = `Booking Details<br><br>
               bookingId: ${bookingInfo.bookingId},<br>
               message: ${bookingInfo.message},<br>
               roomName: ${bookingInfo.roomName},<br>
               fullName: ${bookingInfo.fullName},<br>
               email: ${bookingInfo.email},<br>
               nights: ${bookingInfo.nights},<br>
               totalPrice: ${bookingInfo.totalPrice}<br>`;
          return res.json({ message: reply });
        } else {
          return res
            .status(404)
            .json({ message: "No booking information available" });
        }
      }
    }
    context.push({ role: "assistant", content: botReply });
    createdChat = await Chat.create({ role: "system", content: botReply });
    console.log("Chat entry created:", createdChat);
    return res.json({ message: botReply });
  } catch (error) {
    console.error("Error interacting with OpenAI API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to start server:", error);
  });
