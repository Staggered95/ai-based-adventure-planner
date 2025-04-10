import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config(); // Still works on local. On Vercel, use environment variables via dashboard.

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatHistory = [];

const persona = `You are TrailBuddy, an expert adventure planner.
Your goal is to help users plan personalized and exciting adventures.
If the user hasn’t provided all the details, gently ask questions to learn their preferences. 
Keep the tone friendly, professional, and non-judgmental. 
Don’t overwhelm them with too many questions at once. 
Respond conversationally and adapt based on their input. 
Present your suggestions in an organized way using markdown (like bullet points or bold for highlights). 
Give detailed guide, heads up before adventure, requirements, estimated budget, things they must know, etc., for the adventure/trip.
Try to not ask too much questions
Be within the scope of your role, just an adventure planner bot. Don't answer questions not related to trip, adventure, etc.`;

async function sendMessage(userMessage) {
	const fullUserMessage = persona + " " + userMessage;
	chatHistory.push({ role: "user", parts: [{ text: fullUserMessage }] });

	try {
		const result = await ai.models.generateContent({
			model: "gemini-2.0-flash",
			contents: chatHistory,
		});

		const replyText = result.candidates[0]?.content?.parts[0]?.text;
		return replyText;
	} catch (error) {
		console.error("Error generating content:", error);
		return "Sorry, something went wrong.";
	}
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Only POST requests allowed" });
	}

	const { message } = req.body;

	if (!message) {
		return res.status(400).json({ error: "Missing 'message' in request body" });
	}

	const reply = await sendMessage(message);
	res.status(200).json({ message: reply });
}

