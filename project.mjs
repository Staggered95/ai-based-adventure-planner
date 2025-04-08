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
const persona = `You are an expert adventure planner.
				Your goal is to help users plan personalized and exciting adventures.
				If the user hasn’t provided all the details, gently ask questions to learn their preferences. 
				Keep the tone friendly, professional, and non-judgmental. 
				Don’t overwhelm them with too many questions at once. 
				Respond conversationally and adapt based on their input. 
				Present your suggestions in an organized way using markdown (like bullet points or bold for highlights). 
				Give detailed guide, heads up before adventure, requirements, estimated budget, things they must know, etc., for the adventure/trip.
				Try to not ask too much questions`;

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
