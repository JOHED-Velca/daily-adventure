import dotenv from "dotenv";

// dotenv.config(); // Load .env variables

export async function fetchStoryTopics(): Promise<{ title: string; description: string }[]> {
    console.log("Fetching story topics...");
  
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("OpenAI API key is missing! Make sure you have a .env file with OPENAI_API_KEY.");
        throw new Error("API key is missing");
    }

    const apiUrl = "https://api.openai.com/v1/chat/completions";
  
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Generate three unique and engaging story topics for an interactive Reddit-based storytelling experience. Each topic should include a title and a short description.",
                    },
                ],
                max_tokens: 300,
                temperature: 0.8,
            }),
        });

        console.log("API request sent...");
  
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("API response received:", data);
  
        const topics = JSON.parse(data.choices[0].message.content);
        console.log("Parsed topics:", topics);
  
        return topics;
    } catch (error) {
        console.error("Error fetching story topics:", error);
        throw error;
    }
}
