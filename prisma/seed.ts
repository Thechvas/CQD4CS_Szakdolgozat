import { PrismaClient } from "../src/generated/prisma";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const gameIds = [
  1372, 2165, 2903, 26128, 27789, 95118, 114795, 125174, 198506, 204538, 7360,
  18866, 21593, 36926, 117294, 119171, 125165, 125642, 127165, 132181, 1081,
  2117, 2963, 3212, 3277, 9509, 9804, 117263, 119133, 143440, 386, 891, 1877,
  6292, 7329, 22788, 25657, 26381, 28489, 113344, 1122, 5587, 17000, 19457,
  28540, 54538, 90099, 102584, 103020, 120322,
];

const gameGenreMap: Record<number, string> = {
  1372: "RPG",
  2165: "Shooter",
  2903: "Strategy",
  26128: "Action",
  27789: "Adventure",
  95118: "Puzzle",
  114795: "Platformer",
  125174: "Fighting",
  198506: "Action",
  204538: "RPG",
  7360: "Horror",
  18866: "Simulation",
  21593: "Sports",
  36926: "Racing",
  117294: "RPG",
  119171: "Strategy",
  125165: "Puzzle",
  125642: "Adventure",
  127165: "Platformer",
  132181: "Shooter",
};

function getGenre(gameId: number): string {
  return gameGenreMap[gameId] ?? "Action";
}

function getRandomGameId(exclude: Set<number>) {
  const available = gameIds.filter((id) => !exclude.has(id));
  return faker.helpers.arrayElement(available);
}

function getRandomGameIds(count: number) {
  return faker.helpers.arrayElements(gameIds, count);
}

function generateListName(genre: string): string {
  const templates = [
    `Top ${faker.number.int({ min: 5, max: 15 })} ${genre} Games`,
    `My Favorite ${genre} Titles`,
    `Must-Play ${genre}s`,
    `Underrated ${genre} Gems`,
  ];
  return faker.helpers.arrayElement(templates);
}

function generateListDescription(genre: string): string {
  const templates = [
    `A curated list of the best ${genre.toLowerCase()} games I've played.`,
    `These ${genre.toLowerCase()} games left a strong impression on me.`,
    `If you love ${genre.toLowerCase()} games, check these out!`,
  ];
  return faker.helpers.arrayElement(templates);
}

function generateReviewText(genre: string): string {
  const starters = [
    `One of the best ${genre.toLowerCase()} games I've ever played.`,
    `Really enjoyed the storyline and mechanics.`,
    `A solid experience, but had a few flaws.`,
    `Graphics were amazing, but the gameplay felt repetitive.`,
    `Didn't expect much, but it totally surprised me.`,
  ];
  return faker.helpers.arrayElement(starters);
}

async function main() {
  const users = [];

  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        username:
          faker.internet.displayName() + faker.number.int({ min: 1, max: 999 }),
        email: faker.internet.email(),
        password: faker.internet.password(),
        profilePic: faker.image.avatar(),
        country: faker.location.countryCode(),
      },
    });
    users.push(user);
  }

  for (const user of users) {
    const listCount = faker.number.int({ min: 8, max: 12 });
    for (let i = 0; i < listCount; i++) {
      const gameIdsForList = getRandomGameIds(
        faker.number.int({ min: 3, max: 8 })
      );
      const primaryGenre = getGenre(gameIdsForList[0]);

      await prisma.list.create({
        data: {
          name: generateListName(primaryGenre),
          description: generateListDescription(primaryGenre),
          userId: user.id,
          gameIds: gameIdsForList,
        },
      });
    }

    const reviewedGames = new Set<number>();
    const reviewCount = Math.min(
      gameIds.length,
      faker.number.int({ min: 12, max: 18 })
    );
    for (let i = 0; i < reviewCount; i++) {
      const gameId = getRandomGameId(reviewedGames);
      reviewedGames.add(gameId);
      const genre = getGenre(gameId);

      await prisma.review.create({
        data: {
          text: generateReviewText(genre),
          rating: faker.number.int({ min: 1, max: 10 }),
          userId: user.id,
          gameId,
        },
      });
    }
  }

  for (const follower of users) {
    const possibleFollowings = users.filter((u) => u.id !== follower.id);
    const numberToFollow = faker.number.int({ min: 5, max: 20 });
    const toFollow = faker.helpers.arrayElements(
      possibleFollowings,
      numberToFollow
    );

    for (const following of toFollow) {
      try {
        await prisma.follows.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        });
      } catch {}
    }
  }
}

main()
  .then(() => {
    console.log("Seed complete!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
