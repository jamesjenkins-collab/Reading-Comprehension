export type PiraDifficultyBand = 'LOWER_KS1' | 'LOWER_MID_KS2' | 'MID_KS2' | 'UPPER_KS2';

export interface PiraDifficultyConfig {
    band: PiraDifficultyBand;
    label: string;
    targetYearGroups: number[];
    targetDomains: string[];
    maxWordCount: number;
    complexityDescription: string;
}

export const PIRA_BANDS: Record<PiraDifficultyBand, PiraDifficultyConfig> = {
    LOWER_KS1: {
        band: 'LOWER_KS1',
        label: 'Lower Key Stage 1 (Years 1-2)',
        targetYearGroups: [1, 2],
        targetDomains: ['1a', '1b', '1c', '1d', '1e'],
        maxWordCount: 200,
        complexityDescription: 'Very short, highly decodable sentences. Familiar vocabulary. Focus on direct retrieval (1b).',
    },
    LOWER_MID_KS2: {
        band: 'LOWER_MID_KS2',
        label: 'Lower/Mid Key Stage 2 (Years 3-4)',
        targetYearGroups: [3, 4],
        targetDomains: ['2a', '2b', '2c', '2d', '2e', '2f', '2g', '2h'],
        maxWordCount: 500,
        complexityDescription: 'Introduction of more complex vocabulary and descriptive language. Compound sentences. Test inference (2d) and meaning in context (2a).',
    },
    MID_KS2: {
        band: 'MID_KS2',
        label: 'Mid Key Stage 2 (Year 5)',
        targetYearGroups: [5],
        targetDomains: ['2a', '2b', '2c', '2d', '2e', '2f', '2g', '2h'],
        maxWordCount: 700,
        complexityDescription: 'Noticeable jump in vocabulary. Inclusion of classic literature, playscripts, formatting variations. Focus on unfamiliar word decoding.',
    },
    UPPER_KS2: {
        band: 'UPPER_KS2',
        label: 'Upper Key Stage 2 (Year 6)',
        targetYearGroups: [6],
        targetDomains: ['2a', '2b', '2c', '2d', '2e', '2f', '2g', '2h'],
        maxWordCount: 900,
        complexityDescription: 'High information density. Topic-specific vocabulary. Complex sentence structures. Focus on summarizing (2c), complex inference (2d), impact (2g).',
    },
};

export const READING_DOMAINS = {
    KS1: [
        { code: '1a', description: 'Vocabulary: draw on knowledge of vocabulary to understand texts' },
        { code: '1b', description: 'Retrieval: identify / explain key aspects of fiction and non-fiction texts, such as characters, events, titles and information' },
        { code: '1c', description: 'Summary: identify and explain the sequence of events in texts' },
        { code: '1d', description: 'Inference: make inferences from the text' },
        { code: '1e', description: 'Prediction: predict what might happen on the basis of what has been read so far' }
    ],
    KS2: [
        { code: '2a', description: 'Vocabulary: give / explain the meaning of words in context' },
        { code: '2b', description: 'Retrieval: retrieve and record information / identify key details from fiction and non-fiction' },
        { code: '2c', description: 'Summary: summarise main ideas from more than one paragraph' },
        { code: '2d', description: 'Inference: make inferences from the text / explain and justify inferences with evidence from the text' },
        { code: '2e', description: 'Prediction: predict what might happen from details stated and implied' },
        { code: '2f', description: 'Structure: identify / explain how information / narrative content is related and contributes to meaning as a whole' },
        { code: '2g', description: 'Impact: identify / explain how meaning is enhanced through choice of words and phrases' },
        { code: '2h', description: 'Comparison: make comparisons within the text' }
    ]
};

export function getDifficultyBandsForYear(yearGroup: number): PiraDifficultyBand[] {
    return Object.values(PIRA_BANDS)
        .filter((config) => config.targetYearGroups.includes(yearGroup))
        .map((config) => config.band);
}
