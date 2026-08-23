export const DRAFT_STORAGE_KEY = "plainly:draft";

export type Sample = {
  id: string;
  title: string;
  blurb: string;
  text: string;
};

export const SAMPLES: Sample[] = [
  {
    id: "claude-readme",
    title: "Claude-lish README",
    blurb: "The classic model README: dive in, robust, seamless, I'd be happy to.",
    text: `Great question! I'd be happy to help you understand this library.

In this comprehensive guide, we will walk you through everything you need to know in order to leverage this robust, seamless toolkit. In today's rapidly evolving landscape of developer tools, it plays a pivotal role in empowering teams to unlock their full potential.

It's important to note that users can simply click on Deploy to get started. Feel free to utilize the cache in order to facilitate fewer calls — it's easy!

Let's dive in and explore how the matcher works. The worker is used to pull jobs from the queue, and a 404 status is returned by the server if the resource can't be found. The API will return a JSON object.

At the end of the day, this cutting-edge, best-in-class solution supercharges your workflow. I hope this helps!`,
  },
  {
    id: "chatgpt-blog",
    title: "ChatGPT blog opener",
    blurb: "The tapestry / landscape / when it comes to opener.",
    text: `When it comes to building documentation, it's worth noting that clarity is invaluable. At a high level, this article will explore the multifaceted tapestry of technical writing.

Needless to say, you may want to leverage existing style guides in order to foster better communication. Moving forward, teams that harness these principles will revolutionize the way they communicate.

Let's take a closer look at low-hanging fruit you can hit the ground running with. Simply follow the steps below and you can easily elevate your docs to be world-class.`,
  },
  {
    id: "tutorial",
    title: "Polite tutorial",
    blurb: "Please, simply, just, it's easy — Google's most-broken rules.",
    text: `Please note that in order to install the CLI, you just need to run one command. It's easy!

Please click on Save after you enter your token. Don't hesitate to utilize the verbose flag if you'd like. The user can then simply restart the service.

If the build fails, please make sure to check the logs, etc.`,
  },
  {
    id: "clean",
    title: "A clean control",
    blurb: "Should score well. Present tense, you, no brochure words.",
    text: `To install the CLI, run npm install -g plainly.

You can then lint a file:

    plainly lint README.md

The linter skips fenced code and URLs. If a sentence is longer than 32 words, it flags the sentence.

Click Deploy when you are ready. The API returns JSON.`,
  },
];
