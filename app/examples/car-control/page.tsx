"use client";

import React from 'react';
import Chat from "../../components/chat";
import CameraFeed from '../../components/camera-feed';
import ControlPad from '../../components/control-pad';
import styles from './page.module.css';
import { handleMoveForward, handleMoveBackward, handleTurnLeft, handleTurnRight, handleStop, handleCapture } from '../../utils/car-control';

const CarControlPage = () => {

  const functionCallHandler = async (call) => {
    let result;
    
    try {
      const args = call.function.arguments;
      const name = call.function.name;
      const parsedArgs = args ? JSON.parse(args) : {};

      switch (name) {
        case "move_forward":
          result = await handleMoveForward(parsedArgs);
          break;
        case "move_backward":
          result = await handleMoveBackward(parsedArgs);
          break;
        case "turn_left":
          result = await handleTurnLeft(parsedArgs);
          break;
        case "turn_right":
          result = await handleTurnRight(parsedArgs);
          break;
        case "stop":
          result = await handleStop();
          break;
        case "capture":
          result = await handleCapture();
          break;
        default:
          result = { error: "Unknown function" };
      }
    } catch (error) {
      console.error('Error handling function call:', error);
      result = { error: error.message };
    }

    return JSON.stringify(result);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.column}>
          <CameraFeed />
          <ControlPad />
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat functionCallHandler={functionCallHandler}/>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarControlPage;