"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { List as ListIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddToListProps {
  gameId: number;
}

interface List {
  id: string;
  name: string;
}

export default function AddToList({ gameId }: AddToListProps) {
  const { data: session, status } = useSession();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    axios
      .get<List[]>("/api/list")
      .then((res) => setLists(res.data))
      .catch(() => toast.error("Failed to load your lists."));
  }, [status]);

  const handleAdd = async () => {
    if (!selectedList) return;

    setIsLoading(true);
    try {
      await axios.post("/api/list/add-game", {
        listId: selectedList,
        gameId,
      });
      toast.success("Game added to list!");
      setSelectedList("");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        toast.error("This game is already in the selected list.");
      } else {
        toast.error("Failed to add game to list.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <ListIcon className="text-blue-600" />
        <CardTitle>Add to List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedList}
          onValueChange={setSelectedList}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a list" />
          </SelectTrigger>
          <SelectContent>
            {lists.map((list) => (
              <SelectItem key={list.id} value={list.id}>
                {list.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleAdd}
          disabled={!selectedList || isLoading}
          className="w-full"
        >
          {isLoading ? "Adding..." : "Add to List"}
        </Button>
      </CardContent>
    </Card>
  );
}
