"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { AudioRecorder } from "react-audio-voice-recorder";
import { HiMiniSpeakerWave } from "react-icons/hi2";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  const handleSpeak = async () => {
    console.log("speak", text);
    try {
      const formData = new FormData();
      formData.append("text", text);
      const response = await fetch("/api/tts", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      // Cleanup URL object after audio is played
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Failed to fetch and play the audio:", error);
    }
  };

  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return (
        <div>
          <AssistantMessage text={text} />
          <HiMiniSpeakerWave onClick={handleSpeak} />
        </div>
      );
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall,
  ) => Promise<string>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [sendCameraView, setSendCameraView] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [finalMessage, setFinalMessage] = useState("");
  const messageRef = useRef("");

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const whisperRequest = async (audioFile: Blob) => {
    const formData = new FormData();
    formData.append("file", audioFile, "audio.wav");
    console.log("got audio file,", audioFile);
    try {
      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("whisper response is:", data.text);
      setUserInput(data.text);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // create a new threadID when chat component created
  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  const sendMessage = async (text) => {
    // get file id from api capture
    const capture = await fetch(`/api/capture`);
    const fileId = await capture.text();
    console.log("send message using file id", fileId);
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: [
            {
              type: "text",
              text: text,
            },
            {
              type: "image_file",
              image_file: {
                file_id: fileId,
              },
            },
          ],
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
    messageRef.current = "";
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
      messageRef.current += delta.value;
      console.log("Accumulated message:", messageRef.current);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        if (toolCall.function.name === "capture") {
          console.log("capture function called");
          setSendCameraView(true);
        }
        return { output: result, tool_call_id: toolCall.id };
      }),
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
    console.log("run completed");
    console.log("Auto play:", autoPlay);
    console.log("Final accumulated message:", messageRef.current);
    if (autoPlay && messageRef.current.trim()) {
      console.log("Attempting to play audio");
      handleTextToSpeech(messageRef.current);
    }
    messageRef.current = ""; // Reset for the next message
  };

  const handleTextToSpeech = async (text) => {
    console.log("handleTextToSpeech called with:", text);
    try {
      const formData = new FormData();
      formData.append("text", text);
      const response = await fetch("/api/tts", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Failed to fetch and play the audio:", error);
    }
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (!event) {
        console.error("Received undefined event");
        return;
      }
      if (event.event === "thread.run.requires_action") {
        handleRequiresAction(event);
      }
      if (event.event === "thread.run.completed") {
        handleRunCompleted();
      }
    });

    //wait for stream end and log last message
    stream.on("end", () => {
      console.log("stream ended");
      console.log("last message", messages[messages.length - 1]);
      console.log("send camera view", sendCameraView);
      // if (sendCameraView) {
      //   setSendCameraView(false);
      //   setUserInput("here is the camera view");
      // }
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`,
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  useEffect(() => {
    console.log("Component re-rendered. Current message ref:", messageRef.current);
  }, [messageRef.current]);

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.toggleContainer}>
          <label htmlFor="autoPlayToggle" className={styles.toggleLabel}>
            Auto Play Sound
            <div className={styles.toggleSwitch}>
              <input
                type="checkbox"
                id="autoPlayToggle"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider}></span>
            </div>
          </label>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
        <AudioRecorder
          showVisualizer
          onRecordingComplete={(audioBlob) => whisperRequest(audioBlob)}
        />
      </form>
    </div>
  );
};

export default Chat;
