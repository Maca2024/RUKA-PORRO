/**
 * RUKA PORRO VOXL - API Proxy Server
 * Handles secure communication with AI services
 * AETHERLINK FORGE // ATLAS PROTOCOL
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Allowed ElevenLabs voice IDs (whitelist)
const ALLOWED_VOICE_IDS = new Set([
    'EXAVITQu4vr4xnSDxMaL',  // Default - Sarah
    '21m00Tcm4TlvDq8ikWAM',  // Rachel
    'AZnzlk1XvdvUeBnXmlld',  // Domi
    'ErXwobaYiN019PkySvjV',  // Antoni
    'MF3mGyEYCl7XYWbV9V6O',  // Elli
    'TxGEqnHWrfWFTfGW9XjX',  // Josh
    'VR6AewLTigWG4xSOukaG',  // Arnold
    'pNInz6obpgDQGcFmaJgB',  // Adam
    'yoZ06aMxZJJ28mfd3POQ',  // Sam
]);

// API Configuration - Load from environment variables
const API_CONFIG = {
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        baseUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-5-sonnet-20241022',
        fastModel: 'claude-3-5-haiku-20241022'
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        model: 'gemini-1.5-flash',
        proModel: 'gemini-1.5-pro'
    },
    elevenLabs: {
        apiKey: process.env.ELEVENLABS_API_KEY || '',
        baseUrl: 'https://api.elevenlabs.io/v1',
        model: 'eleven_multilingual_v2'
    }
};

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: { error: 'Too many requests, please slow down' }
});

function createAPIProxy(app) {
    // Apply rate limiting to API routes
    app.use('/api', apiLimiter);

    // Anthropic Claude API Proxy
    app.post('/api/anthropic/chat', async (req, res) => {
        if (!API_CONFIG.anthropic.apiKey) {
            return res.status(500).json({ error: 'Anthropic API key not configured' });
        }

        try {
            const { messages, systemPrompt, stream = true, fast = false } = req.body;

            if (!Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({ error: 'messages must be a non-empty array' });
            }
            if (typeof systemPrompt !== 'string' || systemPrompt.length > 2000) {
                return res.status(400).json({ error: 'Invalid systemPrompt' });
            }

            const response = await fetch(API_CONFIG.anthropic.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.anthropic.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: fast ? API_CONFIG.anthropic.fastModel : API_CONFIG.anthropic.model,
                    max_tokens: 300,
                    system: systemPrompt,
                    messages: messages,
                    stream: stream
                })
            });

            if (!response.ok) {
                return res.status(502).json({ error: 'AI service temporarily unavailable' });
            }

            if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(decoder.decode(value));
                }
                res.end();
            } else {
                const data = await response.json();
                res.json(data);
            }
        } catch (error) {
            console.error('Anthropic API error:', error);
            res.status(500).json({ error: 'AI service temporarily unavailable' });
        }
    });

    // Google Gemini API Proxy
    app.post('/api/gemini/chat', async (req, res) => {
        if (!API_CONFIG.gemini.apiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        try {
            const { messages, systemPrompt, pro = false } = req.body;

            if (!Array.isArray(messages) || messages.length === 0) {
                return res.status(400).json({ error: 'messages must be a non-empty array' });
            }
            if (typeof systemPrompt !== 'string' || systemPrompt.length > 2000) {
                return res.status(400).json({ error: 'Invalid systemPrompt' });
            }
            const model = pro ? API_CONFIG.gemini.proModel : API_CONFIG.gemini.model;

            const response = await fetch(
                `${API_CONFIG.gemini.baseUrl}/${model}:generateContent?key=${API_CONFIG.gemini.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + messages[messages.length - 1].content }] }
                        ],
                        generationConfig: {
                            maxOutputTokens: 300,
                            temperature: 0.8
                        }
                    })
                }
            );

            const data = await response.json();
            res.json({
                content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
            });
        } catch (error) {
            console.error('Gemini API error:', error);
            res.status(500).json({ error: 'AI service temporarily unavailable' });
        }
    });

    // ElevenLabs TTS API Proxy
    app.post('/api/elevenlabs/tts', async (req, res) => {
        if (!API_CONFIG.elevenLabs.apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        try {
            const { text, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = req.body;

            if (typeof text !== 'string' || text.length === 0 || text.length > 1000) {
                return res.status(400).json({ error: 'text must be a string between 1 and 1000 characters' });
            }
            if (!ALLOWED_VOICE_IDS.has(voiceId)) {
                return res.status(400).json({ error: 'Invalid voiceId' });
            }

            const response = await fetch(
                `${API_CONFIG.elevenLabs.baseUrl}/text-to-speech/${voiceId}/stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': API_CONFIG.elevenLabs.apiKey
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: API_CONFIG.elevenLabs.model,
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`ElevenLabs error: ${response.status}`);
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Transfer-Encoding', 'chunked');

            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
            }
            res.end();
        } catch (error) {
            console.error('ElevenLabs API error:', error);
            res.status(500).json({ error: 'TTS service temporarily unavailable' });
        }
    });

    // Get available ElevenLabs voices
    app.get('/api/elevenlabs/voices', async (req, res) => {
        if (!API_CONFIG.elevenLabs.apiKey) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        try {
            const response = await fetch(`${API_CONFIG.elevenLabs.baseUrl}/voices`, {
                headers: { 'xi-api-key': API_CONFIG.elevenLabs.apiKey }
            });
            const data = await response.json();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Voice service temporarily unavailable' });
        }
    });

    // Challenge evaluation endpoint (uses Anthropic or Gemini)
    app.post('/api/evaluate', async (req, res) => {
        try {
            const { systemPrompt, studentResponse } = req.body;

            if (typeof systemPrompt !== 'string' || systemPrompt.length > 2000) {
                return res.status(400).json({ error: 'Invalid systemPrompt' });
            }
            if (typeof studentResponse !== 'string' || studentResponse.length === 0 || studentResponse.length > 5000) {
                return res.status(400).json({ error: 'Invalid studentResponse' });
            }
            const userMessage = `Beoordeel dit antwoord van de student:\n\n${studentResponse}`;

            if (API_CONFIG.anthropic.apiKey) {
                const response = await fetch(API_CONFIG.anthropic.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_CONFIG.anthropic.apiKey,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: API_CONFIG.anthropic.model,
                        max_tokens: 500,
                        system: systemPrompt,
                        messages: [{ role: 'user', content: userMessage }],
                        stream: false
                    })
                });
                const data = await response.json();
                res.json({ content: data.content?.[0]?.text || data.content || 'No evaluation available' });
            } else if (API_CONFIG.gemini.apiKey) {
                const model = API_CONFIG.gemini.model;
                const response = await fetch(
                    `${API_CONFIG.gemini.baseUrl}/${model}:generateContent?key=${API_CONFIG.gemini.apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userMessage }] }],
                            generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
                        })
                    }
                );
                const data = await response.json();
                res.json({ content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No evaluation available' });
            } else {
                res.status(500).json({ error: 'No AI API configured for evaluation' });
            }
        } catch (error) {
            console.error('Evaluation API error:', error);
            res.status(500).json({ error: 'Evaluation service temporarily unavailable' });
        }
    });

    // API Status endpoint
    app.get('/api/status', (req, res) => {
        res.json({
            anthropic: !!API_CONFIG.anthropic.apiKey,
            gemini: !!API_CONFIG.gemini.apiKey,
            elevenLabs: !!API_CONFIG.elevenLabs.apiKey
        });
    });

    console.log('API Proxy routes registered (AI Academy edition)');
}

module.exports = { createAPIProxy };
