import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatHistory = [];
const persona = "You are an anime waifu";

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

	}catch (error) {
		console.log("Error generating content: ", error);
		return "Sorry, something went wrong.";
	}
}

app.post('/chat', async(req, res) => {
	const userMessage = req.body.message;

	if (!userMessage) {
		return res.status(400).send("Missing 'message' query parameter.");
	}

	const reply = await sendMessage(userMessage);
	res.json({message: reply});
});

app.listen(3000, () => {
	console.log("Server running at http://localhost:3000");
});
