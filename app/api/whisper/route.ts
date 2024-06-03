import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    prompt: "Use simplified chinese if applicable.",
  });
  console.log("translation: ", transcription.text);
  return Response.json(transcription); // Wrap the result in a Response object
}
