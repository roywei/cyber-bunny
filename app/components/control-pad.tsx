"use client";

import React from 'react';
import styles from './control-pad.module.css';

const ControlPad = () => {
    const sendCommand = async (command: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/${command}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    speed: 0.3,
                    time: 0.5
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send command: ${command}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={styles.controlPad}>
            <div className={styles.row}>
                <button className={styles.button} onClick={() => sendCommand('move_forward')}>Forward</button>
            </div>
            <div className={styles.row}>
                <button className={styles.button} onClick={() => sendCommand('turn_left')}>Left</button>
                <button className={styles.stopButton} onClick={() => sendCommand('stop')}>Stop</button>
                <button className={styles.button} onClick={() => sendCommand('turn_right')}>Right</button>
            </div>
            <div className={styles.row}>
                <button className={styles.button} onClick={() => sendCommand('move_backward')}>Backward</button>
            </div>
        </div>
    );
};

export default ControlPad;