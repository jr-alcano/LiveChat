import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io("http://localhost:5000"); // server's address

export default function App() {
  const messagesRef = useRef(); //keeps references to the chat messages, allows for autoscrolling later so the latest message is visible
  const [messages, setMessages] = useState([]); //messages is the array of messages, setMessages is the function
  const [text, setText] = useState(''); //text is the input, setText is the the function

  const appendMessage = (message) => { //function to add to messages array
    //adds message.type property to messages or else defaults to just chat
    setMessages(messages => [...messages, { ...message, type: message.type || 'chat' }]);
  };
  

  useEffect(() => { // sets up webSocket listeners, makes sure it runs once with empty dependency array
    socket.on('chat message', (data) => {
        // For messages from other users
        appendMessage({
          text: data.msg, // Assuming the server sends back the text as 'text'
          uid: data.userId,
          userName: data.userName,
        });
      
    });

    socket.on('user connected', (data) => { //'user connected' listener
      appendMessage({ text: `${data.userName} connected to the chat`, uid: data.userId, type: 'notification'});
    });

    socket.on('user disconnected', (data) => { //'user disconnected' listener
      appendMessage({ text: `${data.userName} disconnected from the chat`, uid: data.userId });
    });

    return () => { //cleanup functions to remove sockets once component unmounts
      socket.off('chat message');
      socket.off('user connected');
      socket.off('user disconnected');
    };
  }, []);

  useEffect(() => { //used to automatically scroll to the most recent message
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]); //messages dependency array to make sure it runs with each messages state change

  const sendMessage = (e) => {
    e.preventDefault(); //prevents default form submission
    if (text.trim() === '') return; //error handling, no empty messages 
    socket.emit('chat message', text); //tell server 'chat message' event has happened with current text
    setText(''); //clear input field
  };

  return (
    <main>
      <div className="panel"> {/*container for chat ui*/}
        <div className="messages" ref={messagesRef}>{/*container for messages, ref for reference to DOM, allows automatic scroll*/}
          <div className="inner"> {/*styling purpose*/}
            {messages.map((message, idx) => (    //iterates through messages array and applies the following to each message
              //conditional class name so notifications can be styled separately
              <div key={idx} className={`message ${message.type === 'notification' ? 'notification' : ''}`}>
                <div className={message.uid === socket.id ?  "user-self" : "user-them"}>
                  {message.uid === socket.id ? 'You:' : `${message.userName}:`}
                </div>
                <div className="text">{message.text}</div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={sendMessage}> {/*submit button*/}
          <input value={text} onChange={(e) => setText(e.target.value)} />
          <button>+</button>
        </form>
      </div>
    </main>
  );
}

