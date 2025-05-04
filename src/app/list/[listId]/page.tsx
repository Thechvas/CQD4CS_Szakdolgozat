import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { fetchFromIGDB } from "@/lib/igdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { ListActions } from "@/components/ListActions";
import RemoveGameFromListButton from "@/components/RemoveGameFromListButton";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key } from "react";
import { CommentSection } from "@/components/CommentSection";

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

  const games =
    list.gameIds.length > 0
      ? (
          await fetchFromIGDB(
            "games",
            `
        fields id, name, cover.image_id;
        where id = (${list.gameIds.join(",")});
      `
          )
        ).map((game: any) => ({
          id: game.id,
          name: game.name,
          coverUrl: game.cover
            ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
            : "/default_game_cover.jpg",
        }))
      : [];

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-8">
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

      {games.length === 0 ? (
        <p className="text-gray-500">This list is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map(
            (game: {
              id: Key | null | undefined;
              coverUrl: string | StaticImport;
              name: string;
            }) => (
              <div key={game.id} className="relative group">
                <Link href={`/game/${game.id}`}>
                  <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                    <Image
                      src={game.coverUrl}
                      alt={
                        typeof game.name === "string" ? game.name : "Game cover"
                      }
                      width={264}
                      height={330}
                      className="object-cover w-full h-48"
                    />
                  </div>
                  <h3 className="text-sm font-medium mt-2 group-hover:underline">
                    {game.name}
                  </h3>
                </Link>
                {isOwner && typeof game.id === "number" && (
                  <RemoveGameFromListButton listId={list.id} gameId={game.id} />
                )}
              </div>
            )
          )}
        </div>
      )}
      <CommentSection listId={list.id} />
    </main>
  );
}
