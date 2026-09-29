import { Hono } from "hono";
import { reddit } from "@devvit/web/server";

const app = new Hono();

/**
 * Explicit user action endpoint.
 *
 * The client should call this only after the user has reviewed the exact
 * content and clicked a clearly-labelled "Post as me" button.
 */
app.post("/internal/reddit/post", async (c) => {
  const body = await c.req.json<{
    subredditName: string;
    title: string;
    text: string;
  }>();

  if (!body.subredditName || !body.title || !body.text) {
    return c.json({ ok: false, error: "subredditName, title and text are required" }, 400);
  }

  const post = await reddit.submitCustomPost({
    runAs: "USER",
    subredditName: body.subredditName,
    title: body.title,
    entry: "default",
    userGeneratedContent: {
      text: body.text,
    },
  });

  return c.json({ ok: true, id: post.id });
});

/**
 * Explicit user action endpoint for contextual replies.
 */
app.post("/internal/reddit/comment", async (c) => {
  const body = await c.req.json<{
    parentId: string;
    text: string;
  }>();

  if (!body.parentId || !body.text) {
    return c.json({ ok: false, error: "parentId and text are required" }, 400);
  }

  const comment = await reddit.submitComment({
    runAs: "USER",
    id: body.parentId,
    text: body.text,
  });

  return c.json({ ok: true, id: comment.id });
});

export default app;
