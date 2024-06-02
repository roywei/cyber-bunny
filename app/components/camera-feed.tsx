"use client";

import React, { useEffect, useState } from 'react';
import styles from './camera-feed.module.css';

const CameraFeed = () => {
    console.log("server url is", process.env.NEXT_PUBLIC_SERVER_URL)
    const [imageSrc, setImageSrc] = useState(`${process.env.NEXT_PUBLIC_SERVER_URL}/video_feed`);

    return (
        <div className={styles.cameraFeed}>
            <h2>Camera Feed</h2>
            <img src={imageSrc} alt="Camera Feed" className={styles.image} />
        </div>
    );
};

export default CameraFeed;