# Audio Assets for Hiraeth

This document lists all required audio files and suggestions for creating/sourcing them.

## Required Audio Files

Place all files in `/public/audio/` directory.

### Ambient & Rain

| File | Description | Duration | Source Suggestions |
|------|-------------|----------|-------------------|
| `rain-light.mp3` | Soft ambient rain, loopable | 30-60s loop | Freesound.org, Pixabay |
| `rain-heavy.mp3` | Heavy downpour, intense, loopable | 30-60s loop | Record actual rain or Freesound |

### Paper & Ink Sounds

| File | Description | Duration | Source Suggestions |
|------|-------------|----------|-------------------|
| `paper-rustle.mp3` | Paper being moved/rustled | 2-3s | Record with actual paper |
| `pen-scratch.mp3` | Fountain pen writing on paper | 3-5s | Record with fountain pen |
| `ink-drop.mp3` | Single ink drop hitting paper | 0.5-1s | Record or synthesize |

### Emotional Audio

| File | Description | Duration | Source Suggestions |
|------|-------------|----------|-------------------|
| `whisper.mp3` | Whispered reading of "Am I yearning for a place of the past?" | 4-6s | Record voice |
| `dissonance.mp3` | Unsettling, scratchy dissonant tones, loopable | 20-30s loop | Synthesize with reverb |
| `heartbeat.mp3` | Slow heartbeat, loopable | 5-10s loop | Record or synthesize |

## Recording Tips

### For Paper/Pen Sounds
- Use a quiet room with minimal echo
- Get close to the source (6-12 inches)
- Use actual fountain pen on textured paper
- Record multiple takes, layer for richness

### For Rain
- Real rain recordings have best texture
- Layer multiple rain recordings for depth
- Add subtle low-frequency rumble for weight

### For Whisper
- Record in very quiet space
- Speak slowly, with emotional weight
- Add subtle reverb in post-processing
- Consider recording behind the microphone for "from behind" effect

## Free Sound Resources

- [Freesound.org](https://freesound.org) - CC licensed sounds
- [Pixabay](https://pixabay.com/sound-effects/) - Royalty-free
- [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk/) - Free for personal use
- [Zapsplat](https://www.zapsplat.com/) - Free with attribution

## Audio Processing

All audio should be:
- MP3 format, 128-192kbps
- Normalized to -3dB peak
- Loops should be seamless (crossfade start/end)
- Remove any DC offset
- Apply subtle compression for consistency

## Font File

Also required in `/public/fonts/`:
- `CormorantGaramond-Regular.ttf` - Download from [Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond)
