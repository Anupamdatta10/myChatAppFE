import React, { useEffect, useState ,useRef} from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [file, setFile] = useState(false);
  const [fileType, setFileType] = useState("");
  const handelFile = (e) => {
    console.log(e.target.files[0])
    getBase64(e.target.files[0])
    setFileType(e.target.files[0])
    setFile(true)
  }
  function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      //console.log(reader.result);
      setCurrentMessage(reader.result)
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  const sendMessage = async () => {
    if (currentMessage !== "") {
      let messageData = {
        room: room,
        author: username,
        message: currentMessage,
        type: file ? fileType.type : 'text',
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      if (file) {
        messageData["fileName"] = fileType.name
      }
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setFile(false);
      setFileType("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    socket.on("user_join", (data) => {
      setMessageList((list) => [...list, data]);
    })
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <>{messageContent.author === "system" ? <div className="system-message">{messageContent.message}</div> :
                <div
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">{
                      messageContent.type == 'text' ?
                        <p>{messageContent.message}</p> : <>{messageContent.type.includes('image') ?
                          <img className="img-message" src={messageContent.message} />
                          : <><p>{messageContent.fileName}</p><span className="download"><a download={messageContent.fileName} href={messageContent.message}>&#8595;</a></span></>}</>

                    }
                    </div>
                    <div className="message-meta">
                      <p id="time">{messageContent.time}</p>
                      <p id="author">{messageContent.author}</p>
                    </div>
                  </div>
                </div>}
              </>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={file ? fileType.name : currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            if (file) {
              setCurrentMessage(currentMessage)
            } else {
              setCurrentMessage(event.target.value);
            }
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={() => { sendMessage() }}>&#9658;</button>
      </div>
      <input type="file" onChange={(e) => { handelFile(e) }} />
    </div>
  );
}

export default Chat;
