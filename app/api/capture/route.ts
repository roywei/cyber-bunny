import { openai } from "@/app/openai";
import fs from 'fs';
import path from 'path';

export async function GET() {
    // Add a cache-busting parameter to the URL
    const url = `http://192.168.86.48:5000/capture?_=${new Date().getTime()}`;
    
    // Read image from remote camera
    const capture = await fetch(url);
    const image = await capture.blob();

    // Convert image to a file with a timestamped name
    const timestamp = new Date().getTime();
    const fileName = `capture_${timestamp}.jpg`;
    const filePath = path.join('', fileName); // Update this path to your desired directory

    // Convert the image blob to an ArrayBuffer and then to a Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the file to disk
    fs.writeFileSync(filePath, buffer);

    // Create a File object from the saved file
    const file = new File([buffer], fileName, { type: 'image/jpeg' });

    // Upload the file to OpenAI
    const result = await openai.files.create({
        file: file,
        purpose: "assistants",
    });

    // Return the file ID from OpenAI
    return new Response(result.id);
}