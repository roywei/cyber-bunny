import { openai } from "@/app/openai";

export async function GET() {
    // Add a cache-busting parameter to the URL
    const url = `http://192.168.86.48:5000/capture?_=${new Date().getTime()}`;
    
    // Read image from remote camera
    const capture = await fetch(url);
    const image = await capture.blob();

    // Convert image to a file with a timestamped name
    const timestamp = new Date().getTime();
    const file = new File([image], 'capture_' + timestamp + '.jpg', { type: 'image/jpeg' });

    // Upload the file to OpenAI
    const result = await openai.files.create({
        file: file,
        purpose: "assistants",
    });

    // Return the file ID from OpenAI
    return new Response(result.id);
}