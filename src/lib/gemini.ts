import { GoogleGenAI, Type, Schema } from '@google/genai';
import { PIRA_BANDS, PiraDifficultyBand, READING_DOMAINS } from './pira';

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The schema we expect Gemini to return for the passage and questions
const passageResponseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'The title of the reading passage.'
        },
        passageType: {
            type: Type.STRING,
            enum: ['prose', 'poetry', 'playscript'],
            description: 'The format of the text. Prose is standard text, poetry has stanzas, playscript has characters.'
        },
        content: {
            type: Type.ARRAY,
            description: 'The structure of the text blocks. Each block MUST have a non-empty text field.',
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: 'Block type: text, stanza, stage_direction, dialogue' },
                    text: { type: Type.STRING, description: 'REQUIRED: The full text content of this block. Must never be empty.' },
                    character: { type: Type.STRING, description: 'For playscripts only: the character speaking' },
                },
                required: ['type', 'text']
            }
        },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    readingDomain: { type: Type.STRING, description: 'The National Curriculum reading domain code e.g. 2d' },
                    questionType: { type: Type.STRING, enum: ['multiple_choice'] },
                    prompt: { type: Type.STRING, description: 'The question text' },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: '4 possible multiple choice answers'
                    },
                    correctAnswer: { type: Type.STRING, description: 'The exact string of the correct option' }
                },
                required: ['readingDomain', 'questionType', 'prompt', 'options', 'correctAnswer']
            }
        }
    },
    required: ['title', 'passageType', 'content', 'questions']
};

export async function generatePassage(
    bandKey: PiraDifficultyBand,
    targetDomainCodes: string[],
    topicContext?: string,
    questionCount: number = 5
) {
    const band = PIRA_BANDS[bandKey];
    const isKS1 = bandKey === 'LOWER_KS1';
    const domainList = isKS1 ? READING_DOMAINS.KS1 : READING_DOMAINS.KS2;

    const selectedDomains = domainList.filter(d => targetDomainCodes.includes(d.code));
    const domainDescriptions = selectedDomains.map(d => `${d.code}: ${d.description}`).join('\n');

    const prompt = `
You are an expert UK primary school curriculum designer.
Create a reading comprehension passage and EXACTLY ${questionCount} multiple-choice questions.

1. PASSAGE PARAMETERS
Target Difficulty: ${band.label}
Maximum Word Count: ${band.maxWordCount} words
Characteristics: ${band.complexityDescription}

2. THEME
${topicContext ? `MANDATORY THEME: The story or text MUST be about: ${topicContext}. Do not use generic fantasy themes unless they are directly related to ${topicContext}.` : 'Choose an engaging, age-appropriate topic.'}

3. CONTENT BLOCKS
For prose: Each paragraph is a separate block {"type": "text", "text": "paragraph content here"}
For poetry: Each stanza is a block {"type": "stanza", "text": "line 1\nline 2\nline 3"} with lines separated by \n
For playscript: Each line is {"type": "dialogue", "character": "NAME", "text": "what they say"}
CRITICAL: Every block MUST have a non-empty "text" field. Do NOT produce blocks with empty or missing text.

4. QUESTIONS
Generate EXACTLY ${questionCount} multiple-choice questions. 
Distribute these questions across the following National Curriculum reading domains:
${domainDescriptions}

Ensure that each selected domain has at least one question assigned to it (if the total count allows).

Output the result adhering STRICTLY to the provided JSON schema. Ensure each options array has exactly 4 items.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: passageResponseSchema,
                temperature: 0.7,
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }

        throw new Error('No text returned from Gemini API');
    } catch (error) {
        console.error('Gemini generation error:', error);
        throw error;
    }
}
