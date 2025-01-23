interface EnvConfig {
    OPENAI: {
        API_KEY: string;
        MODEL: string;
        MAX_TOKENS: number;
        TEMPERATURE: number;
    };
    AI_AGENTS: {
        CACHE_DURATION: number; // in hours
        DAILY_REQUEST_LIMIT: number;
    };
    API: {
        BASE_URL: string;
        TIMEOUT: number;
    };
}

const env: EnvConfig = {
    OPENAI: {
        API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        MODEL: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
        MAX_TOKENS: parseInt(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || '300'),
        TEMPERATURE: parseFloat(process.env.NEXT_PUBLIC_OPENAI_TEMPERATURE || '0.7'),
    },
    AI_AGENTS: {
        CACHE_DURATION: parseInt(process.env.NEXT_PUBLIC_AI_CACHE_DURATION || '24'),
        DAILY_REQUEST_LIMIT: parseInt(process.env.NEXT_PUBLIC_AI_DAILY_LIMIT || '100'),
    },
    API: {
        BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
        TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    },
};

export default env; 