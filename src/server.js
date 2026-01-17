/**
 * RUKA PORRO VOXL - Main Server
 * Express server with AI API proxy
 * AETHERLINK FORGE // ATLAS PROTOCOL
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { createAPIProxy } = require('./api-proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

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
