import type { User } from "@/types/user";
import type { Class } from "@/types/class";
import type { Deck } from "@/types/deck";

export const MOCK_CLASSES: Class[] = [
  { id: "class-1", name: "Introduction to Computer Science", code: "CS 101" },
  { id: "class-2", name: "Data Structures", code: "CS 201" },
  { id: "class-3", name: "Biology 101", code: "BIO 101" },
  { id: "class-4", name: "Calculus II", code: "MATH 202" },
];

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    classIds: ["class-1", "class-2"],
    school: "State University",
    major: "Computer Science",
    onboardingCompleted: true,
  },
  {
    id: "user-2",
    name: "Sam Taylor",
    email: "sam@example.com",
    classIds: ["class-1", "class-3"],
    school: "State University",
    major: "Biology",
    onboardingCompleted: true,
  },
  {
    id: "user-3",
    name: "Jordan Lee",
    email: "jordan@example.com",
    classIds: ["class-2", "class-4"],
    school: "State University",
    major: "Mathematics",
    onboardingCompleted: true,
  },
];

export const MOCK_DECKS: Deck[] = [
  {
    id: "deck-1",
    title: "CS 101 - Key Terms",
    cards: [
      { id: "c1", front: "What is an algorithm?", back: "A step-by-step procedure for solving a problem." },
      { id: "c2", front: "What is a variable?", back: "A named storage location that holds a value." },
      { id: "c3", front: "What is a loop?", back: "A control structure that repeats a set of instructions." },
    ],
  },
  {
    id: "deck-2",
    title: "Biology - Cell Structure",
    cards: [
      { id: "c4", front: "What is the mitochondria?", back: "The powerhouse of the cell; produces ATP." },
      { id: "c5", front: "What is the nucleus?", back: "Contains DNA and controls cell activities." },
    ],
  },
];
