const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Award '10 Tokens' badge to demo user
  await prisma.userBadge.create({
    data: {
      userId: user.id,
      badgeId: "badge_10_tokens",
      awardedAt: new Date(),
    },
  });
  // Seed default badges
  await prisma.badge.createMany({
    data: [
      {
        id: "badge_first_interview",
        name: "First Interview",
        imageUrl: "/badge-first-interview.png",
        description:
          "Awarded for completing your first interview and earning 10 tokens.",
        createdAt: new Date(),
      },
      {
        id: "badge_10_tokens",
        name: "10 Tokens",
        imageUrl: "/badge-10-tokens.png",
        description: "Awarded for earning 10 tokens.",
        createdAt: new Date(),
      },
      {
        id: "badge_50_tokens",
        name: "50 Tokens",
        imageUrl: "/badge-50-tokens.png",
        description: "Awarded for earning 50 tokens.",
        createdAt: new Date(),
      },
      {
        id: "badge_7_day_streak",
        name: "7 Day Streak",
        imageUrl: "/badge-7-day-streak.png",
        description: "Awarded for maintaining a 7-day interview streak.",
        createdAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });
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
      {
        role: "Data Scientist",
        level: "Mid",
        type: "Technical",
        techstack: ["Python", "Pandas", "Machine Learning"],
        questions: [
          "What is Pandas?",
          "Explain supervised vs unsupervised learning.",
          "How do you handle missing data?",
        ],
        coverImage: "/public/robot.png",
        finalized: true,
        userId: user.id,
      },
      {
        role: "DevOps Engineer",
        level: "Senior",
        type: "Technical",
        techstack: ["Docker", "Kubernetes", "CI/CD"],
        questions: [
          "What is Docker?",
          "How do you set up a CI/CD pipeline?",
          "Explain Kubernetes pods.",
        ],
        coverImage: "/public/star.svg",
        finalized: true,
        userId: user.id,
      },
      {
        role: "Mobile Developer",
        level: "Junior",
        type: "Technical",
        techstack: ["React Native", "Flutter", "Android/iOS"],
        questions: [
          "What is React Native?",
          "How do you publish an app to the App Store?",
          "Explain state management in Flutter.",
        ],
        coverImage: "/public/react.svg",
        finalized: true,
        userId: user.id,
      },
      {
        role: "UI/UX Designer",
        level: "Mid",
        type: "Design",
        techstack: ["Figma", "Design Systems", "Accessibility"],
        questions: [
          "What is a design system?",
          "How do you ensure accessibility?",
          "Explain prototyping in Figma.",
        ],
        coverImage: "/public/star.svg",
        finalized: true,
        userId: user.id,
      },
      {
        role: "QA Engineer",
        level: "Senior",
        type: "Technical",
        techstack: ["Testing", "Automation", "Selenium"],
        questions: [
          "What is Selenium?",
          "How do you automate browser testing?",
          "Explain the difference between unit and integration tests.",
        ],
        coverImage: "/public/robot.png",
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
