/**
 * RUKA PORRO VOXL - Main Server
 * Express server with AI API proxy
 * AETHERLINK FORGE // ATLAS PROTOCOL
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { createAPIProxy } = require('./api-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            mediaSrc: ["'self'", "blob:"],
            workerSrc: ["'self'", "blob:"]
        }
    }
}));

// CORS - only allow same-origin and local development
const allowedOrigins = [
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// Middleware
app.use(express.json({ limit: '50kb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Create API proxy routes for AI services
createAPIProxy(app);

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '2.0', protocol: 'AETHERLINK FORGE' });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          🦌 RUKA PORRO VOXL - AI EDITION                   ║');
    console.log('║          AETHERLINK FORGE // ATLAS PROTOCOL                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Server running at: http://localhost:${PORT}                    ║`);
    console.log('║  Press Ctrl+C to stop                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    // Check API configuration
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;

    console.log('API Status:');
    console.log(`  Anthropic Claude: ${hasAnthropic ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  Google Gemini:    ${hasGemini ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  ElevenLabs TTS:   ${hasElevenLabs ? '✓ Configured' : '✗ Not configured'}`);
    console.log('');

    if (!hasAnthropic && !hasGemini) {
        console.log('⚠️  No AI API keys configured. NPC dialogue will use fallback mode.');
        console.log('   Set ANTHROPIC_API_KEY or GEMINI_API_KEY environment variables.');
    }
});
