import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function CodeEditor() {
  const { roomId } = useParams();

  const [code, setCode] = useState("");
  const [socket, setSocket] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const [output, setOutput] = useState("");

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [language, setLanguage] = useState("javascript");

  // 🔥 Default code per language
  useEffect(() => {
    if (language === "python") {
      setCode('# start coding...\nprint("hello")');
    } else if (language === "javascript") {
      setCode('// start coding...\nconsole.log("hello")');
    } else if (language === "cpp") {
      setCode(
        '#include <iostream>\nusing namespace std;\nint main(){ cout<<"hello"; return 0; }'
      );
    } else if (language === "java") {
      setCode(
        'class Main { public static void main(String[] args){ System.out.println("hello"); }}'
      );
    } else if (language === "html") {
      setCode("<h1>Hello World</h1>");
    } else if (language === "css") {
      setCode("body { background: black; color: white; }");
    }
  }, [language]);

  // 🔥 SOCKET (username change → reconnect)
  useEffect(() => {
    if (!username) return;

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("join-room", { roomId, username });

    newSocket.on("code-update", (newCode) => setCode(newCode));
    newSocket.on("receive-message", (data) =>
      setMessages((prev) => [...prev, data])
    );
    newSocket.on("user-list", (list) => setUsers(list));

    return () => newSocket.disconnect();
  }, [roomId, username]);

  // ✍️ Code change
  const handleChange = (value) => {
    setCode(value);
    if (socket) socket.emit("code-change", { roomId, code: value });
  };

  // 💬 Chat
  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit("send-message", { roomId, message, username });
      setMessage("");
    }
  };

  // 🚀 Run code (backend)
  const runCode = async () => {
    try {
      if (language === "html" || language === "css") {
        setOutput("Preview नीचे दिखेगा");
        return;
      }

      const res = await fetch("http://localhost:5000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          code,
        }),
      });

      const data = await res.json();
      setOutput(data.output);
    } catch (err) {
      console.error(err);
      setOutput("Error: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* LEFT */}
      <div className="w-3/4 flex flex-col">
        {/* TOP BAR */}
        <div className="p-2 bg-gray-800 flex gap-2 items-center">
          <button
            className="bg-yellow-500 px-3 py-1 rounded text-black"
            onClick={runCode}
          >
            ▶ Run
          </button>

          <select
            className="bg-gray-700 p-1 rounded"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>

        {/* EDITOR */}
        <Editor
          height="60%"
          theme="vs-dark"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={handleChange}
        />

        {/* OUTPUT */}
        <div className="bg-black text-green-400 p-3 h-40 overflow-auto">
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>

        {/* HTML PREVIEW */}
        {(language === "html" || language === "css") && (
          <iframe
            title="preview"
            className="w-full h-40 border"
            srcDoc={code}
          />
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/4 border-l border-gray-700 flex flex-col p-3 bg-gray-800">
        {/* ROOM */}
        <div className="flex justify-between items-center mb-2">
          <h2>Room: {roomId}</h2>
          <button
            className="bg-green-500 px-2 rounded"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied!");
            }}
          >
            Copy
          </button>
        </div>

        {/* USERNAME */}
        <input
          className="mb-2 p-2 text-black rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              localStorage.setItem("username", username);
              alert("Username updated!");
            }
          }}
        />

        {/* USERS */}
        <div className="mb-2">
          <h3>Users:</h3>
          {users.map((u, i) => (
            <p key={i}>• {u}</p>
          ))}
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i}>
              <b>{m.username}:</b> {m.message}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex gap-1 mt-2">
          <input
            className="flex-1 p-2 text-black rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="bg-blue-500 px-2" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;