import type { JournalEntry, StorageSettings } from "./journalTypes.js";

export const DAILY_PROMPTS = [
  {
    promptId: "presence",
    promptText: "How present are you right now? (1–10)",
  },
  {
    promptId: "joy",
    promptText: "What was one moment of joy?",
  },
  {
    promptId: "frustration",
    promptText: "What was one moment of frustration?",
  },
  {
    promptId: "values",
    promptText: "Think of your values. One thing you did that aligns with a value?",
  },
  {
    promptId: "letting-go",
    promptText: "What are you letting go of? What is no longer serving you?",
  },
] as const;

export const mockEntries: JournalEntry[] = [
  {
    id: "entry-001",
    date: "2026-04-11",
    template: "daily-reflection",
    answers: [
      { promptId: "presence", promptText: "How present are you right now? (1–10)", answer: "7" },
      { promptId: "joy", promptText: "What was one moment of joy?", answer: "Made coffee slowly this morning without looking at my phone. Just the smell and the quiet." },
      { promptId: "frustration", promptText: "What was one moment of frustration?", answer: "Got pulled into a meeting that could have been an email. Lost my focus for the rest of the afternoon." },
      { promptId: "values", promptText: "Think of your values. One thing you did that aligns with a value?", answer: "I said no to a request that wasn't mine to carry. That felt right." },
      { promptId: "letting-go", promptText: "What are you letting go of? What is no longer serving you?", answer: "The habit of checking messages the moment I wake up. It sets a reactive tone for the whole day." },
    ],
    markdown: `# April 11, 2026\n\n**Presence:** 7\n\n**Joy:** Made coffee slowly this morning without looking at my phone. Just the smell and the quiet.\n\n**Frustration:** Got pulled into a meeting that could have been an email.\n\n**Values:** Said no to a request that wasn't mine to carry.\n\n**Letting go:** The habit of checking messages the moment I wake up.`,
    createdAt: "2026-04-11T21:30:00.000Z",
    updatedAt: "2026-04-11T21:42:00.000Z",
    source: { backend: "mock", path: "2026-04-11.md" },
  },
  {
    id: "entry-002",
    date: "2026-04-09",
    template: "daily-reflection",
    answers: [
      { promptId: "presence", promptText: "How present are you right now? (1–10)", answer: "5" },
      { promptId: "joy", promptText: "What was one moment of joy?", answer: "My daughter laughed so hard at dinner she had to put down her fork. I don't even remember what was funny — just that sound." },
      { promptId: "frustration", promptText: "What was one moment of frustration?", answer: "Couldn't focus on writing. Kept starting and stopping. The words weren't there." },
      { promptId: "values", promptText: "Think of your values. One thing you did that aligns with a value?", answer: "Put the laptop away during dinner. Small thing, but intentional." },
      { promptId: "letting-go", promptText: "What are you letting go of? What is no longer serving you?", answer: "Expecting every day to be productive. Some days are for being, not doing." },
    ],
    markdown: `# April 9, 2026\n\n**Presence:** 5\n\n**Joy:** My daughter laughed so hard at dinner she had to put down her fork.\n\n**Frustration:** Couldn't focus on writing today.\n\n**Values:** Put the laptop away during dinner.\n\n**Letting go:** Expecting every day to be productive.`,
    createdAt: "2026-04-09T22:05:00.000Z",
    updatedAt: "2026-04-09T22:18:00.000Z",
    source: { backend: "mock", path: "2026-04-09.md" },
  },
  {
    id: "entry-003",
    date: "2026-04-07",
    template: "daily-reflection",
    answers: [
      { promptId: "presence", promptText: "How present are you right now? (1–10)", answer: "8" },
      { promptId: "joy", promptText: "What was one moment of joy?", answer: "Finished a hard problem at work. The kind that takes two days to crack. The satisfaction was quiet but real." },
      { promptId: "frustration", promptText: "What was one moment of frustration?", answer: "Sent an email I shouldn't have. Reacted too fast. Wish I'd waited." },
      { promptId: "values", promptText: "Think of your values. One thing you did that aligns with a value?", answer: "Apologized without defending myself. Just owned it." },
      { promptId: "letting-go", promptText: "What are you letting go of? What is no longer serving you?", answer: "The need to explain myself every time I make a mistake. Sometimes sorry is enough." },
    ],
    markdown: `# April 7, 2026\n\n**Presence:** 8\n\n**Joy:** Finished a hard problem at work.\n\n**Frustration:** Sent an email I shouldn't have. Reacted too fast.\n\n**Values:** Apologized without defending myself.\n\n**Letting go:** The need to explain myself every time I make a mistake.`,
    createdAt: "2026-04-07T20:55:00.000Z",
    updatedAt: "2026-04-07T21:10:00.000Z",
    source: { backend: "mock", path: "2026-04-07.md" },
  },
  {
    id: "entry-004",
    date: "2026-03-28",
    template: "daily-reflection",
    answers: [
      { promptId: "presence", promptText: "How present are you right now? (1–10)", answer: "6" },
      { promptId: "joy", promptText: "What was one moment of joy?", answer: "Long walk in the neighborhood. No podcast, no music. Just the sound of the street." },
      { promptId: "frustration", promptText: "What was one moment of frustration?", answer: "Tried to explain something important and felt completely misunderstood. Gave up and changed the subject." },
      { promptId: "values", promptText: "Think of your values. One thing you did that aligns with a value?", answer: "Chose rest over productivity today. That was the right call." },
      { promptId: "letting-go", promptText: "What are you letting go of? What is no longer serving you?", answer: "The illusion that I can control how I'm perceived. People will think what they think." },
    ],
    markdown: `# March 28, 2026\n\n**Presence:** 6\n\n**Joy:** Long walk with no podcast or music.\n\n**Frustration:** Tried to explain something important and felt misunderstood.\n\n**Values:** Chose rest over productivity.\n\n**Letting go:** The illusion that I can control how I'm perceived.`,
    createdAt: "2026-03-28T21:00:00.000Z",
    updatedAt: "2026-03-28T21:20:00.000Z",
    source: { backend: "mock", path: "2026-03-28.md" },
  },
  {
    id: "entry-005",
    date: "2026-03-15",
    template: "daily-reflection",
    answers: [
      { promptId: "presence", promptText: "How present are you right now? (1–10)", answer: "9" },
      { promptId: "joy", promptText: "What was one moment of joy?", answer: "Cooked a proper meal for the first time in weeks. Chopped and stirred and tasted. Felt grounded." },
      { promptId: "frustration", promptText: "What was one moment of frustration?", answer: "Plans fell through at the last minute. I'd been looking forward to it all week." },
      { promptId: "values", promptText: "Think of your values. One thing you did that aligns with a value?", answer: "Called my father instead of texting. Heard his voice." },
      { promptId: "letting-go", promptText: "What are you letting go of? What is no longer serving you?", answer: "Holding onto grudges from small things. They accumulate like clutter." },
    ],
    markdown: `# March 15, 2026\n\n**Presence:** 9\n\n**Joy:** Cooked a proper meal for the first time in weeks.\n\n**Frustration:** Plans fell through at the last minute.\n\n**Values:** Called my father instead of texting.\n\n**Letting go:** Holding onto grudges from small things.`,
    createdAt: "2026-03-15T21:45:00.000Z",
    updatedAt: "2026-03-15T22:00:00.000Z",
    source: { backend: "mock", path: "2026-03-15.md" },
  },
];

export const mockSettings: StorageSettings = {
  backend: "mock",
  localPath: undefined,
  googleDriveFolderId: undefined,
  personalValues: ["Presence", "Honesty", "Growth", "Rest", "Connection"],
};
