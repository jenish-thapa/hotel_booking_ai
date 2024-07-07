# Hotel Booking AI

This is a chatbot powered by the OpenAI API, designed to assist customers with hotel bookings through chat. It integrates a React Frontend for easy interaction, allowing users to inquire about available rooms or book directly from website.

## Project Setup

Follow these steps to set up and run AI chatbot on your local machine.

### Cloning the Repository

First, clone the repository to your local machine:

```sh
git clone https://github.com/jenish-thapa/hotel_booking_ai
```

### Installing Dependencies

Install the necessary dependencies for both backend as well as frontend.

- For the backend directory:

```sh
cd backend
npm install
```

Open a new Terminal.

- For the frontend directory:

```sh
cd frontend
npm install
```

### Setting Up Environment Variables

You need to set up environment variable for the OpenAI API key.

- **OpenAI API Key**: Sign up at [OpenAI](https://openai.com/) to get your API key. Create a [`.env`] file in the root directory and add your OpenAI API


```env
OPENAI_API_KEY="your_openai_api_key_here"
```


### Running the Servers

Start the servers to get the chatbot running. First, run the main server:

```sh
cd backend
node server.js
```

Open a new Terminal.

```sh
cd frontend
npm run start
```

### Starting a Conversation

Open your browser and start a conversation!

## Testing the Bot Without UI

You can test the bot functionality without using the Telegram UI by making API calls directly to the `/chat` endpoint.

Example POST request:

```sh
curl -X POST http://localhost:3000/chat \
-H "Content-Type: application/json" \
-d '{"message": "Hello, I would like to book a hotel room."}'
```

This will send a message to your chatbot, and you should receive a response based on the bot's logic and integration with the OpenAI API.