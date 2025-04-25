import { PrismaClient } from '../src/generated/prisma';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const gameIds = [
  1372, 2165, 2903, 26128, 27789, 95118, 114795, 125174, 198506, 204538,
  7360, 18866, 21593, 36926, 117294, 119171, 125165, 125642, 127165, 132181,
  1081, 2117, 2963, 3212, 3277, 9509, 9804, 117263, 119133, 143440,
  386, 891, 1877, 6292, 7329, 22788, 25657, 26381, 28489, 113344,
  1122, 5587, 17000, 19457, 28540, 54538, 90099, 102584, 103020, 120322
];

function getRandomGameId() {
  return faker.helpers.arrayElement(gameIds);
}

function getRandomGameIds(count : number) {
  return faker.helpers.arrayElements(gameIds, count);
}

async function main() {
  const users = [];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.displayName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        profilePic: faker.image.avatar(),
        country: faker.location.countryCode(),
      },
    });
    users.push(user);
  }


  for (const user of users) {
    const listCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < listCount; i++) {
      await prisma.list.create({
        data: {
          name: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          userId: user.id,
          gameIds: getRandomGameIds(faker.number.int({ min: 2, max: 6 })),
        },
      });
    }

    const reviewCount = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < reviewCount; i++) {
      await prisma.review.create({
        data: {
          text: faker.lorem.paragraph(),
          rating: faker.number.int({ min: 1, max: 10 }),
          userId: user.id,
          gameId: getRandomGameId(),
        },
      });
    }
  }

  for (const follower of users) {
    const followingCandidates = users.filter(u => u.id !== follower.id);
    const numberToFollow = faker.number.int({ min: 1, max: 5 });

    const shuffled = faker.helpers.shuffle(followingCandidates);
    const toFollow = shuffled.slice(0, numberToFollow);

    for (const following of toFollow) {
      await prisma.follows.create({
        data: {
          followerId: follower.id,
          followingId: following.id,
        },
      });
    }
  }
}

main()
  .then(() => {
    console.log('Success!');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
