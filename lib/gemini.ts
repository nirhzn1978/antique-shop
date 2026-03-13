import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initialize the Google Generative AI client using the API key from environment variables.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Structured response from Gemini for product analysis.
 */
export interface ProductSuggestion {
  title: string;
  description: string;
  category: string;
  suggestedPrice: number | null;
}

/**
 * Generates a title, description, and suggested price for an antique item based on its image.
 * Uses Gemini 1.5 Flash for high-speed vision-to-text processing.
 * 
 * @param imageBase64 - The product image encoded in base64 format (without the data:image prefix).
 * @returns A structured object containing the AI-generated suggestions.
 */
export async function analyzeProductImage(imageBase64: string): Promise<ProductSuggestion | { error: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The prompt provides strict instructions to ensure the output is valid JSON and in Hebrew.
    const prompt = `אתה מומחה להערכת חפצי עתיקות ויד שנייה. 
תנתח את התמונה המצורפת ותחזיר אובייקט JSON המכיל את השדות הבאים בעברית בלבד:
1. title: שם קצר וקולע לפריט (למשל: כד נחושת עתיק).
2. description: תיאור מפורט של הפריט, המצב שלו, סגנון עיצובי והיסטוריה משוערת.
3. category: קטגוריה מתאימה (למשל: ספרים, רהיטים, כלי נחושת, תקליטים, פריטים נדירים).
4. material: החומר ממנו עשוי הפריט.
5. suggestedPrice: מחיר מומלץ למכירה בשקלים (מספר בלבד).

תחזיר אך ורק את אובייקט ה-JSON, ללא טקסט נוסף לפניו או אחריו.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean-up potential markdown code blocks in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    
    return JSON.parse(jsonMatch[0]) as ProductSuggestion;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { error: "Failed to analyze image" };
  }
}
