import "dotenv/config";
import OpenAI from "openai";

async function test() {
  try {
    const ai = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY || "",
      baseURL: "https://api.groq.com/openai/v1"
    });
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Say hello in JSON format: { \"message\": \"...\" }" }],
      response_format: { type: "json_object" },
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
