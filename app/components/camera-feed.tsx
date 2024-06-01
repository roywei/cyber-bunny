"use client";

import React, { useEffect, useState } from 'react';
import styles from './camera-feed.module.css';

const CameraFeed = () => {
    const [imageSrc, setImageSrc] = useState('http://192.168.86.48:5000/video_feed');

    return (
        <div className={styles.cameraFeed}>
            <h2>Camera Feed</h2>
            <img src={imageSrc} alt="Camera Feed" className={styles.image} />
        </div>
    );
};

export default CameraFeed;