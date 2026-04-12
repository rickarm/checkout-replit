export const prompts = [
  {
    id: "presence",
    text: "How present are you right now?",
    type: "slider",
    min: 1,
    max: 10,
    helpText: "1 = completely distracted, 10 = fully here"
  },
  {
    id: "joy",
    text: "What was one moment of joy?",
    type: "textarea",
    placeholder: "A good cup of coffee, a kind word, sunlight..."
  },
  {
    id: "frustration",
    text: "What was one moment of frustration?",
    type: "textarea",
    placeholder: "Traffic, a difficult conversation, feeling stuck..."
  },
  {
    id: "values",
    text: "Think of your values. One thing you did that aligns with a value?",
    type: "textarea",
    placeholder: "Patience, creativity, honesty..."
  },
  {
    id: "letting_go",
    text: "What are you letting go of? What is no longer serving you?",
    type: "textarea",
    placeholder: "A grudge, an unrealistic expectation, tension in your shoulders..."
  }
];
