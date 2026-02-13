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
      {
        id: "c1",
        front: "What is an algorithm?",
        back: "A step-by-step procedure for solving a problem.",
      },
      {
        id: "c2",
        front: "What is a variable?",
        back: "A named storage location that holds a value.",
      },
      {
        id: "c3",
        front: "What is a loop?",
        back: "A control structure that repeats a set of instructions.",
      },
    ],
  },
  {
    id: "deck-2",
    title: "Biology - Cell Structure",
    cards: [
      {
        id: "c4",
        front: "What is the mitochondria?",
        back: "The powerhouse of the cell; produces ATP.",
      },
      {
        id: "c5",
        front: "What is the nucleus?",
        back: "Contains DNA and controls cell activities.",
      },
    ],
  },
  {
    id: "deck-3",
    title: "Jeopardy Sample - Computer Science",
    cards: [
      {
        id: "j1",
        front: "What is an algorithm?",
        back: "A step-by-step procedure for solving a problem.",
      },
      {
        id: "j2",
        front: "What is a variable?",
        back: "A named storage location that holds a value.",
      },
      {
        id: "j3",
        front: "What is a loop?",
        back: "A control structure that repeats instructions.",
      },
      { id: "j4", front: "What is OOP?", back: "Object-Oriented Programming." },
      { id: "j5", front: "What is API?", back: "Application Programming Interface." },
      {
        id: "j6",
        front: "What is a function?",
        back: "A reusable block of code that performs a task.",
      },
      { id: "j7", front: "What is recursion?", back: "A function that calls itself." },
      { id: "j8", front: "What is a stack?", back: "A LIFO data structure." },
      { id: "j9", front: "What is a queue?", back: "A FIFO data structure." },
      {
        id: "j10",
        front: "What is a hash table?",
        back: "A data structure for key-value lookups.",
      },
      {
        id: "j11",
        front: "What is Big O notation?",
        back: "Measures algorithmic complexity.",
      },
      { id: "j12", front: "What is Git?", back: "A version control system." },
      {
        id: "j13",
        front: "What is SQL?",
        back: "Structured Query Language for databases.",
      },
      {
        id: "j14",
        front: "What is REST?",
        back: "Representational State Transfer API design.",
      },
      { id: "j15", front: "What is MVC?", back: "Model-View-Controller architecture." },
      {
        id: "j16",
        front: "What is a compiler?",
        back: "Translates source code to machine code.",
      },
      {
        id: "j17",
        front: "What is an array?",
        back: "A contiguous collection of elements.",
      },
      {
        id: "j18",
        front: "What is a linked list?",
        back: "Elements linked by pointers.",
      },
      {
        id: "j19",
        front: "What is a binary tree?",
        back: "A tree with at most two children per node.",
      },
      {
        id: "j20",
        front: "What is async/await?",
        back: "JavaScript pattern for asynchronous code.",
      },
      {
        id: "j21",
        front: "What is a closure?",
        back: "A function that captures its lexical scope.",
      },
      {
        id: "j22",
        front: "What is the DOM?",
        back: "Document Object Model for web pages.",
      },
      {
        id: "j23",
        front: "What is React?",
        back: "A JavaScript library for building UIs.",
      },
      { id: "j24", front: "What is TypeScript?", back: "Typed superset of JavaScript." },
      { id: "j25", front: "What is CSS?", back: "Cascading Style Sheets for styling." },
    ],
  },
];
