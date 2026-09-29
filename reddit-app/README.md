# Kolkata Startup Map — Reddit Assistant

This is a separate Devvit app scaffold for Reddit distribution.

## What it will do

- Let Siddhartha connect/use the Reddit account through Reddit's official Devvit authentication.
- Present a draft before posting.
- Require an explicit button press before every Reddit post/comment.
- Keep Reddit actions separate from other app actions.
- Avoid automated spam, mass posting, voting, or engagement manipulation.

Reddit's current User Actions policy requires explicit manual confirmation before posting/commenting as the user.

## Setup

Reddit's current flow is:

1. Open https://developers.reddit.com/new
2. Create a Devvit React app while signed into the Reddit account you want to use.
3. Connect the Reddit account during the setup wizard.
4. Copy the generated Devvit project into this directory or use this directory as the project base.
5. Install dependencies with npm.
6. Run the Devvit playtest.
7. Test in a subreddit you control/moderate.
8. Submit for Reddit review before broader installation.

The existing Kolkata Startup Map GitHub Pages app remains separate from this Reddit app.

## Planned workflow

Relevant Reddit discussion
→ draft contextual response
→ show exact text + target subreddit/thread
→ **Post as Siddhartha** button
→ Reddit confirmation/result
→ record the Reddit URL

No automatic posting.

## Current status

Scaffold/documentation only. Reddit authentication and publishing must be completed through Reddit's Devvit developer flow; credentials must never be committed to this repository.
