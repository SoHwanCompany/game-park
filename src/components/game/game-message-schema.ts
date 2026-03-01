import { z } from 'zod';

export const gameMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('READY'), payload: z.object({}) }),
  z.object({ type: z.literal('SCORE'), payload: z.object({ score: z.number() }) }),
  z.object({
    type: z.literal('GAME_OVER'),
    payload: z.object({
      userId: z.string(),
      gameId: z.string(),
      score: z.number(),
      playtime: z.number(),
    }),
  }),
  z.object({
    type: z.literal('ERROR'),
    payload: z.object({ code: z.string(), message: z.string() }),
  }),
]);
