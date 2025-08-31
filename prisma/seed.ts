import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Example user
  const user = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: "hashedpassword",
      name: "Student User",
      profileURL: null,
      resumeURL: null,
    },
  });

  // Example interviews
  await prisma.interview.createMany({
    data: [
      {
        role: "Frontend Developer",
        level: "Junior",
        type: "Technical",
        techstack: ["React", "JavaScript", "CSS"],
        questions: [
          "What is React?",
          "Explain CSS Flexbox.",
          "How do you manage state in React?",
        ],
        coverImage: "/public/react.svg",
        finalized: true,
        userId: user.id,
      },
      {
        role: "Backend Developer",
        level: "Mid",
        type: "Technical",
        techstack: ["Node.js", "Express", "MongoDB"],
        questions: [
          "What is middleware in Express?",
          "How do you connect to MongoDB?",
          "Explain RESTful APIs.",
        ],
        coverImage: "/public/robot.png",
        finalized: true,
        userId: user.id,
      },
      {
        role: "Full Stack Engineer",
        level: "Senior",
        type: "Technical",
        techstack: ["React", "Node.js", "TypeScript"],
        questions: [
          "How do you structure a full stack app?",
          "What is TypeScript?",
          "How do you handle authentication?",
        ],
        coverImage: "/public/star.svg",
        finalized: true,
        userId: user.id,
      },
    ],
  });

  console.log("Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
