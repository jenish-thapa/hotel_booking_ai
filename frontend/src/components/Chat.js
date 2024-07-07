import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);

  const sendMessage = async () => {
    if (input.trim() === "") return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input },
    ]);
    let inp = input;
    setInput("");
    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inp }),
      });
      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: data.message },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    // Scroll chat box to the bottom when messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div id="big-cont">
      <h1>Chat with Bot</h1>
      <div id="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
            dangerouslySetInnerHTML={{ __html: msg.content }}
          ></div>
        ))}
      </div>
      <div id="inputs">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
