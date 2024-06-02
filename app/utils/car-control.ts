async function handleMoveForward(args) {
    const response = await fetch("http://192.168.86.48:5000/move_forward", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    return await response.json();
  }
  
  async function handleMoveBackward(args) {
    const response = await fetch("http://192.168.86.48:5000/move_backward", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    return await response.json();
  }
  
  async function handleTurnLeft(args) {
    const response = await fetch("http://192.168.86.48:5000/turn_left", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    return await response.json();
  }
  
  async function handleTurnRight(args) {
    const response = await fetch("http://192.168.86.48:5000/turn_right", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    return await response.json();
  }
  
  async function handleStop() {
    const response = await fetch("http://192.168.86.48:5000/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  }

  async function handleCapture() {
    return "user will send a camera view image in next message, please stop function call, wait for user input and continue your goal."
  }

  export { handleMoveForward, handleMoveBackward, handleTurnLeft, handleTurnRight, handleStop, handleCapture}