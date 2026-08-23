import type { Rule } from "./types.ts";

/**
 * Operationalized Google Developer Documentation Style Guide (CC BY 4.0)
 * plus Plainly's anti-slop appendix for Claude-lish / Chat-lish.
 * Independent of Google; not endorsed by Google.
 */
export const RULES: Rule[] = [
  {
    id: "second-person",
    title: "Use you, not we or the user",
    category: "voice",
    origin: "google",
    severity: "style",
    summary:
      "Address the reader as you. Don't hide behind we, one, or the user when you mean the person doing the task.",
    why: "Second person names the actor. The reader always knows who should act.",
    doExample: "You can filter the log by severity.",
    dontExample: "The user can filter the log by severity.",
    patterns: [
      {
        source: "\\bthe user(?:'s)? can\\b",
        message: "Say you, not the user.",
        suggestion: "you can",
      },
      {
        source: "\\busers can\\b",
        message: "Address the reader as you.",
        suggestion: "you can",
      },
      {
        source: "\\bone can\\b",
        message: "Avoid one. Say you.",
        suggestion: "you can",
      },
      {
        source: "\\bit is possible to\\b",
        message: "Name the actor.",
        suggestion: "you can",
      },
    ],
  },
  {
    id: "active-voice",
    title: "Use active voice",
    category: "voice",
    origin: "google",
    severity: "style",
    summary:
      "Make clear who performs the action. Don't hide the actor behind is used or was performed.",
    why: "Passive voice forces the reader to reverse-engineer the sentence.",
    doExample: "The server returns a 404 status.",
    dontExample: "A 404 status is returned by the server.",
    patterns: [
      {
        source:
          "\\b(?:is|are|was|were|be|been)\\s+(?:used|performed|executed|displayed|shown|returned|called|invoked|provided|configured)\\b",
        message: "This reads as passive. Name who does the action.",
      },
      {
        source: "\\bcan be (?:used|found|seen|done|achieved|performed)\\b",
        message: "Rewrite in active voice.",
        suggestion: "you can …",
      },
    ],
  },
  {
    id: "present-tense",
    title: "Write in present tense",
    category: "voice",
    origin: "google",
    severity: "style",
    summary:
      "Describe how the product works now. Don't use will for current behavior.",
    why: "Documentation is a description of the system, not a forecast.",
    doExample: "The API returns a JSON object.",
    dontExample: "The API will return a JSON object.",
    patterns: [
      {
        source:
          "\\bwill (?:return|display|show|create|allow|enable|let|provide|generate|send|open)\\b",
        message: "Use present tense for current behavior.",
        suggestion: "returns / displays / creates (present)",
      },
    ],
  },
  {
    id: "no-preannounce",
    title: "Don't pre-announce",
    category: "structure",
    origin: "google",
    severity: "slop",
    summary:
      "Don't tell the reader what this document will cover. Start with the answer or the task.",
    why: "Pre-announcements delay the point. The heading already said what the page is.",
    doExample: "To install the CLI, run npm install -g plainly.",
    dontExample:
      "In this guide, we will walk you through how to install the CLI.",
    patterns: [
      {
        source:
          "\\bin this (?:guide|article|document|post|section|tutorial|chapter)\\b",
        message: "Don't pre-announce. Start with the task.",
      },
      {
        source:
          "\\b(?:this|the following) (?:guide|article|document|section|tutorial) will\\b",
        message: "Cut the forecast. State the fact or the step.",
      },
      {
        source: "\\bwe will (?:walk you through|cover|discuss|explore|learn)\\b",
        message: "Don't announce the lesson. Teach it.",
      },
      {
        source: "\\blet me (?:walk you through|explain|break (?:it|this) down)\\b",
        message: "Skip the tour guide. Start the explanation.",
      },
    ],
  },
  {
    id: "conditions-first",
    title: "Put conditions before instructions",
    category: "structure",
    origin: "google",
    severity: "style",
    summary:
      "State the circumstance, then the action. Don't bury the if at the end of the sentence.",
    why: "Readers who don't meet the condition still have to read the instruction.",
    doExample: "If the build fails, check the log in /tmp/app-startup.log.",
    dontExample: "Check the log in /tmp/app-startup.log if the build fails.",
  },
  {
    id: "please",
    title: "Don't say please",
    category: "words",
    origin: "google",
    severity: "style",
    summary:
      "Drop please from instructions. Direct is not rude.",
    why: "Please adds politeness theater and no information.",
    doExample: "Click Save.",
    dontExample: "Please click Save.",
    patterns: [
      {
        source:
          "\\bplease (?:note|click|enter|make sure|ensure|be sure|refer|see|use|try|consider|feel)\\b",
        message: "Drop please. Give the instruction.",
      },
      {
        source: "\\bplease note that\\b",
        message: "Delete please note that. State the fact.",
      },
    ],
  },
  {
    id: "simply-just-easy",
    title: "Don't say simply, just, or easy",
    category: "words",
    origin: "google",
    severity: "style",
    summary:
      "What is simple for you may not be simple for the reader. Cut the adverb.",
    why: "These words shame the reader when the step isn't obvious.",
    doExample: "Run the migration, then restart the server.",
    dontExample: "Simply run the migration, then just restart the server. It's easy.",
    patterns: [
      {
        source: "\\bsimply\\b",
        message: "Delete simply.",
      },
      {
        source: "\\beasily\\b",
        message: "Delete easily. Describe the step.",
      },
      {
        source: "\\bit'?s (?:easy|simple) to\\b",
        message: "Don't call the task easy.",
      },
      {
        source: "\\bjust (?:click|run|add|type|enter|use|need to|have to)\\b",
        message: "Delete just. Give the step.",
      },
    ],
  },
  {
    id: "in-order-to",
    title: "Say to, not in order to",
    category: "words",
    origin: "google",
    severity: "nit",
    summary: "In order to is three extra words that mean to.",
    why: "Shorter sentences scan.",
    doExample: "To enable auth, set the flag.",
    dontExample: "In order to enable auth, set the flag.",
    patterns: [
      {
        source: "\\bin order to\\b",
        message: "Use to.",
        suggestion: "to",
      },
      {
        source: "\\bdue to the fact that\\b",
        message: "Use because.",
        suggestion: "because",
      },
      {
        source: "\\bin the event that\\b",
        message: "Use if.",
        suggestion: "if",
      },
      {
        source: "\\bfor the purpose of\\b",
        message: "Use to or for.",
      },
      {
        source: "\\bat this point in time\\b",
        message: "Use now or delete.",
        suggestion: "now",
      },
    ],
  },
  {
    id: "leverage-utilize",
    title: "Say use, not leverage or utilize",
    category: "words",
    origin: "google",
    severity: "style",
    summary:
      "Leverage and utilize almost always mean use. Use the short word.",
    why: "Latinate verbs are a tell of padded prose.",
    doExample: "Use the cache to skip repeated calls.",
    dontExample: "Leverage the cache in order to utilize fewer calls.",
    patterns: [
      {
        source: "\\bleverage[sd]?\\b",
        message: "Use use, not leverage.",
        suggestion: "use",
      },
      {
        source: "\\butiliz(?:e|es|ed|ing)\\b",
        message: "Use use, not utilize.",
        suggestion: "use",
      },
      {
        source: "\\bfacilitat(?:e|es|ed|ing)\\b",
        message: "Name the action. Facilitate is vague.",
      },
    ],
  },
  {
    id: "click-on",
    title: "Click, don't click on",
    category: "words",
    origin: "google",
    severity: "nit",
    summary: "Write click Save, not click on Save.",
    why: "Google's UI language drops the extra preposition.",
    doExample: "Click Deploy.",
    dontExample: "Click on Deploy.",
    patterns: [
      {
        source: "\\bclick on\\b",
        message: "Write click, not click on.",
        suggestion: "click",
      },
    ],
  },
  {
    id: "etc",
    title: "Don't trail off with etc.",
    category: "words",
    origin: "google",
    severity: "nit",
    summary:
      "Finish the list, or write including. Don't make the reader guess the rest.",
    why: "Etc. hides incomplete thinking.",
    doExample: "Supports JSON, YAML, and TOML.",
    dontExample: "Supports JSON, YAML, etc.",
    patterns: [
      {
        source: "\\betc\\.?\\b",
        message: "Finish the list or write including.",
      },
      {
        source: "\\band so on\\b",
        message: "Finish the list.",
      },
    ],
  },
  {
    id: "exclamation",
    title: "Don't shout",
    category: "voice",
    origin: "google",
    severity: "nit",
    summary: "Documentation does not need exclamation marks.",
    why: "Excitement in docs reads as marketing, not help.",
    doExample: "The test passed.",
    dontExample: "The test passed!",
    patterns: [
      {
        source: "(?<!\\[)!(?:\\s|$)",
        message: "Drop the exclamation mark.",
      },
    ],
  },
  {
    id: "sentence-case",
    title: "Use sentence case in headings",
    category: "structure",
    origin: "google",
    severity: "nit",
    summary:
      "Capitalize the first word and proper nouns. Don't Title Case Every Word.",
    why: "Sentence case is faster to scan and matches Google's house style.",
    doExample: "Install the CLI",
    dontExample: "Install The CLI",
  },
  {
    id: "global-audience",
    title: "Write for a global audience",
    category: "global",
    origin: "google",
    severity: "style",
    summary:
      "Avoid idioms, slang, sports metaphors, and culture-specific jokes.",
    why: "Many readers learned English as a second language. Idioms don't travel.",
    doExample: "This is the smallest useful change.",
    dontExample: "This is low-hanging fruit. Let's hit the ground running.",
    patterns: [
      {
        source: "\\blow-hanging fruit\\b",
        message: "Idiom. Say the smallest useful change.",
      },
      {
        source: "\\bhit the ground running\\b",
        message: "Idiom. Say start immediately or similar.",
      },
      {
        source: "\\bmove the needle\\b",
        message: "Idiom. Say what actually changes.",
      },
      {
        source: "\\bcircle back\\b",
        message: "Office idiom. Say return to this.",
      },
      {
        source: "\\btouch base\\b",
        message: "Office idiom. Say talk or follow up.",
      },
      {
        source: "\\bin a nutshell\\b",
        message: "Idiom. Write a short summary instead.",
      },
      {
        source: "\\bpiece of cake\\b",
        message: "Idiom. Don't call the task easy.",
      },
      {
        source: "\\beat our (?:own )?cake\\b",
        message: "Idiom.",
      },
    ],
  },
  {
    id: "throat-clearing",
    title: "Cut the throat-clearing",
    category: "slop",
    origin: "plainly",
    severity: "slop",
    summary:
      "Claude-lish opens with Certainly, Great question, I'd be happy to. Delete it.",
    why: "The reader already asked. Start with the answer.",
    doExample: "The cache key is the request path plus the auth header.",
    dontExample: "Great question! I'd be happy to help explain how the cache key works.",
    patterns: [
      {
        source: "\\bi'?d be happy to\\b",
        message: "Throat-clearing. Start with the answer.",
      },
      {
        source: "\\b(?:certainly|absolutely|of course|sure thing)\\s*[!.,]",
        message: "Delete the cheerleading opener.",
      },
      {
        source: "\\bgreat question\\b",
        message: "Don't praise the question. Answer it.",
      },
      {
        source: "\\bas an ai\\b",
        message: "Don't announce that you are a model.",
      },
      {
        source: "\\bi hope this helps\\b",
        message: "Don't close with a plea. Stop when you're done.",
      },
      {
        source: "\\bwithout further ado\\b",
        message: "There was already ado. Start.",
      },
      {
        source: "\\blet's get started\\b",
        message: "You already started. Do the work.",
      },
    ],
  },
  {
    id: "ai-hedges",
    title: "Don't narrate the note",
    category: "slop",
    origin: "plainly",
    severity: "slop",
    summary:
      "It's important to note, it should be noted, it's worth mentioning. Just say the thing.",
    why: "If it's important, the sentence already is. The wrapper is padding.",
    doExample: "Auth is off unless you name accounts in the request.",
    dontExample: "It's important to note that auth is off unless you name accounts.",
    patterns: [
      {
        source: "\\bit'?s important to (?:note|mention|remember|understand)\\b",
        message: "Delete the wrapper. State the fact.",
      },
      {
        source: "\\bit'?s worth (?:noting|mentioning|remembering)\\b",
        message: "If it's worth noting, note it. Drop the preface.",
      },
      {
        source: "\\bit should be noted\\b",
        message: "State the fact.",
      },
      {
        source: "\\bneedless to say\\b",
        message: "If it's needless, don't say it.",
      },
      {
        source: "\\bit goes without saying\\b",
        message: "Then don't say it.",
      },
      {
        source: "\\bas previously mentioned\\b",
        message: "Don't point at earlier prose. Repeat the fact if needed.",
      },
      {
        source: "\\brest assured\\b",
        message: "Don't soothe. Inform.",
      },
    ],
  },
  {
    id: "dive-delve",
    title: "Don't dive, delve, or explore",
    category: "slop",
    origin: "plainly",
    severity: "slop",
    summary:
      "Let's dive in, delve into, take a deep dive, explore the landscape. These are Chat-lish.",
    why: "They announce effort instead of transferring knowledge.",
    doExample: "The matcher tests each rule in order.",
    dontExample: "Let's dive in and explore how the matcher works.",
    patterns: [
      {
        source:
          "\\blet's (?:dive|delve|explore|take a look|break (?:it|this) down|unpack)\\b",
        message: "Skip the invitation. Explain.",
      },
      {
        source: "\\bdelve(?:s|d|ing)? into\\b",
        message: "Say examine, describe, or just start.",
      },
      {
        source: "\\bdeep dive\\b",
        message: "Say a detailed look, or just look.",
      },
      {
        source: "\\btake a (?:closer )?look at\\b",
        message: "Look, then report. Don't announce the looking.",
      },
    ],
  },
  {
    id: "buzzwords",
    title: "Ban the brochure words",
    category: "slop",
    origin: "plainly",
    severity: "slop",
    summary:
      "Robust, seamless, cutting-edge, groundbreaking, unlock, empower, foster, harness, tapestry, landscape, pivotal, multifaceted.",
    why: "These words are how a model sounds like a press release. They rarely survive a fact check.",
    doExample: "The job retries three times, then fails.",
    dontExample:
      "A robust, seamless pipeline that empowers teams to unlock their full potential.",
    patterns: [
      {
        source: "\\bcutting[- ]edge\\b",
        message: "Brochure word. Say what is actually new.",
      },
      {
        source: "\\bgroundbreaking\\b",
        message: "Brochure word. Drop it unless you can name the break.",
      },
      {
        source: "\\bgame[- ]changer\\b",
        message: "Say what changed.",
      },
      {
        source: "\\bstate-of-the-art\\b",
        message: "Be specific, or delete.",
      },
      {
        source: "\\bnext-generation\\b",
        message: "Name the generation, or delete.",
      },
      {
        source: "\\bbest-in-class\\b",
        message: "Compared to what? Delete or prove it.",
      },
      {
        source: "\\bworld-class\\b",
        message: "Unverifiable. Delete.",
      },
      {
        source: "\\bseamless(?:ly)?\\b",
        message: "Seamless usually means we didn't describe the steps.",
      },
      {
        source: "\\brobust\\b",
        message: "Say what it survives: retries, bad input, load.",
      },
      {
        source: "\\bempower(?:s|ing|ed)?\\b",
        message: "Name the capability you are giving the reader.",
      },
      {
        source: "\\bunleash(?:es|ing|ed)?\\b",
        message: "Nothing is in a cage. Say what the feature does.",
      },
      {
        source: "\\bunlock(?:s|ing)? the (?:full )?potential\\b",
        message: "Empty. Say the outcome.",
      },
      {
        source: "\\belevate your\\b",
        message: "Marketing. Describe the change.",
      },
      {
        source: "\\btransform the way\\b",
        message: "Say the old way and the new way.",
      },
      {
        source: "\\bfoster(?:s|ing|ed)?\\b",
        message: "Foster is vague. Name the action.",
      },
      {
        source: "\\bharness(?:es|ing|ed)?\\b",
        message: "Say use.",
        suggestion: "use",
      },
      {
        source: "\\bmultifaceted\\b",
        message: "List the facets, or delete.",
      },
      {
        source: "\\bpivotal\\b",
        message: "If it matters, the sentence can stand without this word.",
      },
      {
        source: "\\btapestry\\b",
        message: "Chat-lish metaphor. Don't weave.",
      },
      {
        source: "\\blandscape of\\b",
        message: "Say the actual domain: APIs, vendors, options.",
      },
      {
        source: "\\bunderscores? the (?:importance|need|significance)\\b",
        message: "Don't underscore. State why it matters.",
      },
      {
        source: "\\brevolutionize\\b",
        message: "Almost never true. Describe the change.",
      },
      {
        source: "\\bsupercharge\\b",
        message: "Say faster, or say by how much.",
      },
      {
        source: "\\bholistic\\b",
        message: "Say what is included.",
      },
      {
        source: "\\bsynerg(?:y|ies|istic)\\b",
        message: "Corporate fog. Name the interaction.",
      },
      {
        source: "\\bparadigm\\b",
        message: "Usually means approach. Use that.",
      },
      {
        source: "\\bin today'?s (?:rapidly )?evolving\\b",
        message: "Stock opener. Delete the whole clause.",
      },
      {
        source: "\\bplays? a (?:vital|crucial|pivotal|key) role\\b",
        message: "Say what it does.",
      },
      {
        source: "\\bcomprehensive (?:suite|solution|overview|guide)\\b",
        message: "Comprehensive is a claim. List what it covers.",
      },
      {
        source: "\\binvaluable\\b",
        message: "Let the reader decide. Describe the benefit.",
      },
      {
        source: "\\bmoving forward\\b",
        message: "Say from now or delete.",
      },
      {
        source: "\\bgoing forward\\b",
        message: "Say from now or delete.",
      },
      {
        source: "\\bat a high level\\b",
        message: "Just give the summary.",
      },
      {
        source: "\\bwhen it comes to\\b",
        message: "Filler. Start with the subject.",
      },
    ],
  },
  {
    id: "politeness-theater",
    title: "Don't hedge the instruction",
    category: "slop",
    origin: "plainly",
    severity: "style",
    summary:
      "Feel free to, don't hesitate to, you may want to, you might consider. If they should do it, tell them.",
    why: "Hedges make optional what is often required.",
    doExample: "Pass the project id in the header.",
    dontExample: "Feel free to pass the project id in the header if you'd like.",
    patterns: [
      {
        source: "\\bfeel free to\\b",
        message: "If they should do it, tell them. If it's optional, say optional.",
      },
      {
        source: "\\bdon'?t hesitate to\\b",
        message: "Hesitation theater. Give the action.",
      },
      {
        source: "\\byou may want to\\b",
        message: "Should they? If yes, write the imperative.",
      },
      {
        source: "\\byou might want to\\b",
        message: "Should they? If yes, write the imperative.",
      },
      {
        source: "\\bit is recommended (?:that you)?\\b",
        message: "Say we recommend X or do X.",
      },
    ],
  },
  {
    id: "long-sentence",
    title: "Keep sentences short",
    category: "structure",
    origin: "google",
    severity: "nit",
    summary:
      "Aim under 25 words. Split at 32. A 40-word sentence is almost always two sentences.",
    why: "Short sentences survive translation, scanning, and tired readers.",
    doExample: "The worker pulls a job. It writes the result to storage.",
    dontExample:
      "The worker, which is responsible for pulling a job from the queue and writing the result to storage after performing validation, then acknowledges the message.",
  },
];

export const RULES_BY_ID: Record<string, Rule> = Object.fromEntries(
  RULES.map((rule) => [rule.id, rule]),
);
