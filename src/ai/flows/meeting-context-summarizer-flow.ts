'use server';
/**
 * @fileOverview A GenAI agent that generates a concise summary or key context from a meeting title and description.
 *
 * - summarizeMeetingContext - A function that handles the meeting context summarization process.
 * - MeetingContextSummarizerInput - The input type for the summarizeMeetingContext function.
 * - MeetingContextSummarizerOutput - The return type for the summarizeMeetingContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeetingContextSummarizerInputSchema = z.object({
  title: z.string().describe('The title of the meeting.'),
  description: z
    .string()
    .optional()
    .describe('An optional detailed description of the meeting.'),
});
export type MeetingContextSummarizerInput = z.infer<
  typeof MeetingContextSummarizerInputSchema
>;

const MeetingContextSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise summary or key context for the meeting.'),
});
export type MeetingContextSummarizerOutput = z.infer<
  typeof MeetingContextSummarizerOutputSchema
>;

export async function summarizeMeetingContext(
  input: MeetingContextSummarizerInput
): Promise<MeetingContextSummarizerOutput> {
  return meetingContextSummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meetingContextSummarizerPrompt',
  input: {schema: MeetingContextSummarizerInputSchema},
  output: {schema: MeetingContextSummarizerOutputSchema},
  prompt: `You are an AI assistant tasked with generating a concise summary or key context for a meeting notification.

Your goal is to provide enough information for a user to quickly understand the purpose of the meeting without needing to open their calendar.

Meeting Title: {{{title}}}
{{#if description}}Meeting Description: {{{description}}}{{/if}}

Based on the provided title and description, generate a concise summary or key context.`,
});

const meetingContextSummarizerFlow = ai.defineFlow(
  {
    name: 'meetingContextSummarizerFlow',
    inputSchema: MeetingContextSummarizerInputSchema,
    outputSchema: MeetingContextSummarizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
