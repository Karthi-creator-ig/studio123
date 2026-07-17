'use server';
/**
 * @fileOverview A Genkit flow for suggesting optimal meeting times across multiple timezones.
 *
 * - optimalMeetingTimeSuggester - A function that suggests the most respectful and convenient time windows for meetings.
 * - OptimalMeetingTimeSuggesterInput - The input type for the optimalMeetingTimeSuggester function.
 * - OptimalMeetingTimeSuggesterOutput - The return type for the optimalMeetingTimeSuggester function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimalMeetingTimeSuggesterInputSchema = z.object({
  meetingTitle: z.string().describe('The title or topic of the meeting.'),
  meetingDurationMinutes: z.number().int().positive().describe('The duration of the meeting in minutes.'),
  participants: z.array(
    z.object({
      name: z.string().describe('The name of the participant.'),
      timezone: z.string().describe('The IANA timezone identifier for the participant (e.g., "America/New_York", "Europe/London").'),
      workingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().describe('Optional preferred start time for working hours in HH:MM format (24-hour). Defaults to 09:00 (9 AM) if not provided.'),
      workingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().describe('Optional preferred end time for working hours in HH:MM format (24-hour). Defaults to 17:00 (5 PM) if not provided.'),
    })
  ).describe('A list of meeting participants, including their names, timezones, and optional preferred working hours.'),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('The specific date for which to suggest meeting times, in YYYY-MM-DD format. The AI should prioritize this date.'),
});
export type OptimalMeetingTimeSuggesterInput = z.infer<typeof OptimalMeetingTimeSuggesterInputSchema>;

const OptimalMeetingTimeSuggesterOutputSchema = z.object({
  suggestedTimeWindows: z.array(
    z.object({
      startTimeUTC: z.string().datetime().describe('The suggested start time of the meeting in UTC, as an ISO 8601 string (e.g., "2023-10-27T14:00:00Z").'),
      endTimeUTC: z.string().datetime().describe('The suggested end time of the meeting in UTC, as an ISO 8601 string (e.g., "2023-10-27T15:00:00Z").'),
      reasoning: z.string().describe('A brief explanation of why this time window is optimal, considering all participants\' timezones and working hours.'),
      participantLocalTimes: z.array(
        z.object({
          name: z.string().describe('Participant name.'),
          localStartTime: z.string().describe('The suggested start time in the participant\'s local timezone, formatted for readability (e.g., "10:00 AM PST").'),
          localEndTime: z.string().describe('The suggested end time in the participant\'s local timezone, formatted for readability (e.g., "11:00 AM PST").'),
          isDuringWorkingHours: z.boolean().describe('True if the suggested time falls completely within the participant\'s local working hours (defaults to 9 AM - 5 PM if not specified).'),
        })
      ).describe('Details of the suggested time window for each participant in their local time.'),
    })
  ).describe('A list of suggested optimal meeting time windows, ordered by preference (most optimal first).'),
});
export type OptimalMeetingTimeSuggesterOutput = z.infer<typeof OptimalMeetingTimeSuggesterOutputSchema>;

const prompt = ai.definePrompt({
  name: 'optimalMeetingTimeSuggesterPrompt',
  input: { schema: OptimalMeetingTimeSuggesterInputSchema },
  output: { schema: OptimalMeetingTimeSuggesterOutputSchema },
  prompt: `You are an AI assistant specialized in scheduling and timezone management. Your task is to analyze meeting details and participants' timezones to suggest the most optimal meeting time windows on the specified target date.\n\nMeeting Details:\nTitle: {{{meetingTitle}}}\nDuration: {{{meetingDurationMinutes}}} minutes\nTarget Date: {{{targetDate}}}\n\nParticipants:\n{{#each participants}}\n- Name: {{{name}}}, Timezone: {{{timezone}}}{{#if workingHoursStart}}, Working Hours: from {{{workingHoursStart}}} to {{{workingHoursEnd}}}{{else}}, Default Working Hours: 09:00 to 17:00{{/if}}\n{{/each}}\n\nInstructions:\n1.  Identify 2-3 optimal time windows on the {{{targetDate}}} that minimize inconvenience for all participants, prioritizing times when everyone is within their local working hours (09:00-17:00 by default, or specified working hours if provided).\n2.  For each suggested time window:\n    a.  Provide the 'startTimeUTC' and 'endTimeUTC' in ISO 8601 format (e.g., "YYYY-MM-DDTHH:MM:SSZ"). Ensure these times are calculated correctly based on the target date.\n    b.  Provide a 'reasoning' explaining why it's optimal, highlighting how it accommodates different timezones.\n    c.  For each participant, include their 'localStartTime' and 'localEndTime' formatted for human readability (e.g., "10:00 AM PST"), and indicate whether 'isDuringWorkingHours' is true for that window based on their local time and specified/default working hours.\n\nConsider the following points:\n- The target date should be strictly observed for all suggestions.\n- Ensure the meeting duration is accurately applied.\n- Prioritize times when all participants are within their specified or default working hours (09:00-17:00 local time). If an ideal overlap is not possible, suggest the best compromise.\n- Output the suggestions in an array, ordered from most preferred to least preferred.\n`,
});

const optimalMeetingTimeSuggesterFlow = ai.defineFlow(
  {
    name: 'optimalMeetingTimeSuggesterFlow',
    inputSchema: OptimalMeetingTimeSuggesterInputSchema,
    outputSchema: OptimalMeetingTimeSuggesterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate meeting time suggestions.');
    }
    return output;
  }
);

export async function optimalMeetingTimeSuggester(
  input: OptimalMeetingTimeSuggesterInput
): Promise<OptimalMeetingTimeSuggesterOutput> {
  return optimalMeetingTimeSuggesterFlow(input);
}
