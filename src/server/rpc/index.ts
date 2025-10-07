import { chat } from "@/server/rpc/chat";
import { models } from "@/server/rpc/models";
import { router } from "@orpc/server";

export const rpc = router({
  chat,
  ai: {
    models,
  },
});
