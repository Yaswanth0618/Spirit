// Updated SpiritRadio Backend using Beatoven.ai v1 API

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const BEATOVEN_API_KEY = 'zl9akEJjTzvIUIsLICmqdQ';
const BASE_URL = 'https://public-api.beatoven.ai/api/v1';

// Create a new track with mood + task prompt
router.post('/generate-beat', async (req, res) => {
  const { mood, taskType } = req.body;
  const textPrompt = `30 seconds ${resolveMood(mood)} ${resolveGenre(taskType)} track`;

  try {
    const response = await axios.post(
      `${BASE_URL}/tracks/compose`,
      { prompt: { text: textPrompt }, format: 'mp3', looping: false },
      { headers: { Authorization: `Bearer ${BEATOVEN_API_KEY}` } }
    );

    const taskId = response.data.task_id;
    res.status(200).json({ taskId });
  } catch (err) {
    console.error('[SpiritRadio] Composition Error:', err.message);
    res.status(500).json({ error: 'Beat generation failed.' });
  }
});

// Check beat status
router.get('/track-status/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const statusResponse = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${BEATOVEN_API_KEY}` }
    });

    const status = statusResponse.data.status;
    const trackURL = statusResponse.data.meta?.track_url;

    if (status === 'composed') {
      res.status(200).json({
        status,
        download_url: trackURL,
        message: '✅ Track ready to vibe!'
      });
    } else {
      res.status(202).json({
        status,
        message: '⏳ Composing your custom beat...'
      });
    }
  } catch (err) {
    console.error('[SpiritRadio] Status Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch beat status.' });
  }
});

// Export as MP3
router.get('/export-track/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const statusResp = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${BEATOVEN_API_KEY}` }
    });

    const trackURL = statusResp.data.meta?.track_url;
    if (!trackURL) return res.status(404).json({ error: 'Track not available.' });

    const filePath = path.join(__dirname, 'downloads', `${uuidv4()}.mp3`);
    const writer = fs.createWriteStream(filePath);

    const trackStream = await axios.get(trackURL, { responseType: 'stream' });
    trackStream.data.pipe(writer);

    writer.on('finish', () => {
      res.download(filePath, 'SpiritRadio_Track.mp3', () => {
        fs.unlink(filePath, () => {});
      });
    });

    writer.on('error', () => {
      res.status(500).json({ error: 'Download failed.' });
    });
  } catch (err) {
    console.error('[SpiritRadio] Export Error:', err.message);
    res.status(500).json({ error: 'Failed to export track.' });
  }
});

function resolveGenre(task) {
  const map = {
    study: 'lo-fi',
    writing: 'cinematic',
    coding: 'chill hop',
    workout: 'electronic',
    relax: 'ambient'
  };
  return map[task.toLowerCase()] || 'lo-fi';
}

function resolveMood(mood) {
  const map = {
    happy: 'peaceful',
    sad: 'melancholy',
    tired: 'calm',
    neutral: 'neutral',
    focused: 'intense',
    energetic: 'uplifting'
  };
  return map[mood.toLowerCase()] || 'neutral';
}

module.exports = router;
be