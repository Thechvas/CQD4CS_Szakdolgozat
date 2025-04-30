import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { fetchFromIGDB } from "@/lib/igdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { ListActions } from "@/components/ListActions";

interface GameInfo {
  id: number;
  name: string;
  coverUrl: string;
}

export default async function ListPage({
  params,
}: {
  params: { listId: string };
}) {
  const { listId } = await params;
  const session = await getServerSession(authOptions);

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePic: true,
        },
      },
    },
  });

  if (!list) return notFound();

  const isOwner = session?.user?.username === list.user.username;

  const Header = (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold mb-2">{list.name}</h1>
        <p className="text-gray-700 text-lg">{list.description}</p>
      </div>

      <div className="flex flex-col items-end text-sm text-gray-600">
        {isOwner && (
          <div className="flex gap-2 mb-3">
            <ListActions listId={list.id} />
          </div>
        )}

        <Link
          href={`/user/${list.user.username}`}
          className="flex items-center gap-2 hover:underline"
        >
          <Image
            src={list.user.profilePic || "/default_profile.jpg"}
            alt={`${list.user.username}'s profile picture`}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="font-semibold">{list.user.username}</span>
        </Link>
        <p className="mt-1 text-xs">
          Created at: {new Date(list.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  if (list.gameIds.length === 0) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        {Header}
        <p className="text-gray-500 mt-6">This list is empty.</p>
      </main>
    );
  }

  const gamesData = await fetchFromIGDB(
    "games",
    `
    fields id, name, cover.image_id;
    where id = (${list.gameIds.join(",")});
  `
  );

  const games: GameInfo[] = gamesData.map((game: any) => ({
    id: game.id,
    name: game.name,
    coverUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : "/default_game_cover.jpg",
  }));

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-8">
      {Header}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={`/game/${game.id}`} className="group">
            <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              <Image
                src={game.coverUrl}
                alt={game.name}
                width={264}
                height={330}
                className="object-cover w-full h-48"
              />
            </div>
            <h3 className="text-sm font-medium mt-2 group-hover:underline">
              {game.name}
            </h3>
          </Link>
        ))}
      </div>
    </main>
  );
}
