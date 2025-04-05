import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import readline from 'readline/promises';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const chatHistory = [];
  const persona = "You are an adventure tour planner, you are supposed to understand user's requirements and suggest a place to travel or go to tour next, you should be humble and official sounding, speak in short but precise sentences, ask the user if they need any type of more info sometimes to keep responses catering users requirements, give your suggestions about what they can ask as well";

  async function sendMessage(userMessage) {
    const fullUserMessage = persona + " " + userMessage;
    chatHistory.push({ role: "user", parts: [{ text: fullUserMessage }] });

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: chatHistory,
      });

      //console.log("Result:", result); // Log the entire result object

      const generatedText = result.candidates[0]?.content?.parts[0]?.text;

      if (generatedText) {
        //console.log("You:", userMessage);
        console.log("\n");
	console.log("Lia: ", generatedText);
	console.log("\n\n");
        chatHistory.push({ role: "model", parts: [{ text: generatedText }] });
      } else {
        console.log("AI: No response.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
    }
  }

  console.log("Welcome to AI based adventure planner, I am Lia and I am here to assist you...   (Type 'exit' to end.)");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function askQuestion() {
    const input = await rl.question("You: ");
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    await sendMessage(input);
    askQuestion();
  }

  askQuestion();
}

main().catch(console.error);
