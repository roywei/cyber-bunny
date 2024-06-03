async function handleMoveForward(args) {
  console.log("url is ", process.env.NEXT_PUBLIC_SERVER_URL);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/move_forward`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    },
  );
  return await response.json();
}

async function handleMoveBackward(args) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/move_backward`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    },
  );
  return await response.json();
}

async function handleTurnLeft(args) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/turn_left`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    },
  );
  return await response.json();
}

async function handleTurnRight(args) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/turn_right`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    },
  );
  return await response.json();
}

async function handleStop() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

async function handleCapture() {
  return "user will send a camera view image in next message, please stop function call, wait for user input and continue your goal.";
}

export {
  handleMoveForward,
  handleMoveBackward,
  handleTurnLeft,
  handleTurnRight,
  handleStop,
  handleCapture,
};
