import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const text = formData.get("text");
    console.log("calling tts for text: ", text);
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return new Response("Error generating speech", { status: 500 });
  }
}
