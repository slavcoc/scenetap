import express, { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { createPlayerSchema, validateBody } from '@shared/types';
import type { CreatePlayerInput } from '@shared/types';
import { routes } from './routes';
import { errorHandler } from './middlewares/error-handler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(routes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running perfectly!' });
});

// Example: contract-based Zod validation with validateBody
app.post(
  '/api/players',
  validateBody(createPlayerSchema),
  (req: Request<{}, {}, CreatePlayerInput>, res: Response) => {
    // req.body is validated & typed as CreatePlayerInput
    const { email, provider, timezone } = req.body;
    // … create player logic here …
    res.status(201).json({ message: 'Player created', player: { email, provider, timezone } });
  },
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Initialize the official Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post('/api/analyze-script', async (req, res) => {
  const { scriptText } = req.body;

  if (!scriptText) {
    return res.status(400).json({ error: 'Please provide scriptText in the request body.' });
  }

  try {
    const systemPrompt = `You are an expert Hollywood script doctor and film historian. 
Your goal is to analyze the provided movie script and extract exactly 6 of the most iconic, impactful, and memorable dialogue snippets—the specific lines that would make the movie instantly recognizable to an audience or film enthusiast.

CRITERIA FOR SELECTION:
1. High Memorability: Avoid generic exposition (e.g., "Pass the salt"). Choose lines with distinct rhythm, emotional weight, or structural importance.
2. Character Defining: The quote should reflect the core personality or wit of the character.
3. Culturally Recognizable: Lines that feel like the "thesis statement" or standout trailer moments of the film.

Please format your final output as a clean JSON array containing exactly 6 items, like this:
[
  {
    "number": 1,
    "character": "Character Name",
    "context": "1 brief sentence explaining the scene or emotional state.",
    "dialogue": "The exact quote text."
  }
]`;

    // Call the Anthropic Messages API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Standard identifier for 3.5 Sonnet
      max_tokens: 1500,
      temperature: 0.2, // Lower temperature keeps the extraction strict and analytical
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Opt-in to prompt caching. This cuts input costs by 90% if you ask 
          // follow-up questions about this setup within a 5-minute window.
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Here is the movie script text:\n\n${scriptText}`,
              // Cache the script content as well so modifying the prompt later is ultra-cheap
              cache_control: { type: 'ephemeral' }
            }
          ]
        }
      ]
    });

    // Extract text output from Claude
    const textOutput = response.content
  .filter(block => block.type === 'text')
  .map(block => block.text)
  .join('\n');

if (!textOutput) {
  return res.status(500).json({ error: 'No text content returned from Claude.' });
}

    // Send the response back to your client along with token usage metrics
    res.json({
      success: true,
      analysis: textOutput,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        // Track your prompt caching efficiency
        cache_creation_tokens: response.usage.cache_creation_input_tokens || 0,
        cache_read_tokens: response.usage.cache_read_input_tokens || 0
      }
    });

  } catch (error) {
    console.error('Error communicating with Claude:', error);
    res.status(500).json({ error: 'Failed to process the script with Claude API.' });
  }
});

app.use(errorHandler);