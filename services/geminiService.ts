
import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerProfile, GeneratedEmail } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateOutreachEmail = async (profile: InfluencerProfile, template?: string): Promise<GeneratedEmail> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const model = "gemini-2.5-flash";
  
  // Base instructions
  let systemInstruction = `
    You are an expert Global Marketing Manager specializing in Influencer Marketing. 
    Your task is to write high-conversion, personalized, and professional cold outreach emails in English.
    
    The user will provide details about an influencer and their product/brand.
    You must:
    1. Write in excellent, native-level English.
    2. Adopt a professional yet warm and approachable tone.
    3. USE GOOGLE SEARCH to find the most recent and relevant information about the influencer (${profile.handle} on ${profile.platform}) to verify their content style and recent activities. Use this grounded information to make the email highly personalized.
    4. Include specific compliments based on the user's notes AND your search findings.
    5. Sign off as "${profile.senderName || 'Marketing Manager'}", with the title "Marketing Manager".
    
    Input text may be in Chinese or English, but the Output Email MUST be in English.

    IMPORTANT OUTPUT FORMAT:
    You must return a raw JSON object string. Do not wrap it in markdown code blocks.
    The JSON must have the following structure:
    {
      "subject": "The subject line",
      "body": "The email body content..."
    }
  `;

  // Dynamic Prompt Construction
  let prompt = '';

  if (template && template.trim().length > 0) {
    // TEMPLATE ADAPTATION MODE
    systemInstruction += `
      CRITICAL INSTRUCTION: The user has provided a SPECIFIC EMAIL TEMPLATE. 
      You must NOT write a new email from scratch. 
      Instead, you must REWRITE the provided template to fit the specific influencer using grounded information.
      
      Rules for rewriting:
      - Keep the core value proposition, the offer, and the Call to Action (CTA) from the template exactly as is or very close to it.
      - COMPLETELY REWRITE the introduction and the "bridge" to be highly personalized based on the "My Observations" and your Google Search findings.
      - Make the transition from the personal compliment to the template's pitch natural.
      - Ensure the subject line is based on the template's vibe but personalized.
    `;

    prompt = `
      Sender Name: ${profile.senderName}
      Influencer Name: ${profile.name}
      Influencer Platform: ${profile.platform}
      My Brand Info: ${profile.brandInfo}
      
      My Observations/Analysis (USE THIS TO PERSONALIZE THE INTRO):
      "${profile.description}"
      
      ======
      THE BASE TEMPLATE TO ADAPT:
      "${template}"
      ======
      
      Generate a valid JSON response with keys "subject" and "body".
    `;
  } else {
    // GENERATION FROM SCRATCH MODE
    systemInstruction += `
      4. Clearly state the value proposition of the brand or the collaboration opportunity.
         - If the user provides a brand name, use it.
         - If the user provides a description or nothing, frame it as a partnership opportunity.
      5. Keep it concise.
    `;

    prompt = `
      Sender Name: ${profile.senderName}
      Influencer Name: ${profile.name}
      Platform: ${profile.platform}
      Handle/Channel: ${profile.handle}
      My Brand/Product Info: ${profile.brandInfo || "Not specified (General Partnership Inquiry)"}
      
      My Observations/Analysis of the Influencer (use this for personalization):
      "${profile.description}"
      
      Generate a valid JSON response with keys "subject" and "body".
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed when using googleSearch tool
      },
    });

    let jsonText = response.text || "";
    
    // Clean up potential markdown formatting from the response
    jsonText = jsonText.replace(/```json\n?|```/g, "").trim();

    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    let data: GeneratedEmail;
    try {
        data = JSON.parse(jsonText) as GeneratedEmail;
    } catch (e) {
        console.error("JSON Parse Error", jsonText);
        throw new Error("AI response was not valid JSON. Please try again.");
    }

    // Extract Grounding Metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
            return { title: chunk.web.title, uri: chunk.web.uri };
        }
        return null;
      })
      .filter((item): item is { title: string; uri: string } => item !== null);

    // Filter unique sources by URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());
    data.sources = uniqueSources;

    return data;

  } catch (error) {
    console.error("Error generating email:", error);
    throw new Error("Failed to generate email. Please check your inputs and try again.");
  }
};

export const generateFollowUpEmail = async (profile: InfluencerProfile): Promise<GeneratedEmail> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are an expert Global Marketing Manager. 
    Task: Write a polite, short, and professional follow-up email to an influencer who hasn't replied to the first outreach sent 3-4 days ago.
    
    Guidelines:
    1. Be brief and non-intrusive (bump logic).
    2. Reiterate the interest in collaborating lightly.
    3. Do not sound desperate or annoyed.
    4. Sign off as "${profile.senderName || 'Marketing Manager'}".
    5. English language only.
  `;

  const prompt = `
    Sender Name: ${profile.senderName}
    Influencer Name: ${profile.name}
    Brand Info: ${profile.brandInfo || "our brand"}
    
    Context: We sent them an email recently about a partnership opportunity based on their content ("${profile.description}"), but they haven't replied.
    
    Generate a JSON response with a simple follow-up subject line (e.g., "Quick bump", "Following up") and the email body.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: {
              type: Type.STRING,
              description: "A short, polite follow-up subject line.",
            },
            body: {
              type: Type.STRING,
              description: "The body of the follow-up email.",
            },
          },
          required: ["subject", "body"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    
    return JSON.parse(jsonText) as GeneratedEmail;
  } catch (error) {
    console.error("Error generating follow-up:", error);
    throw new Error("Failed to generate follow-up email.");
  }
};
