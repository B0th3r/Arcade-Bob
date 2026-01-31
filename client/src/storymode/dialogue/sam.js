const samDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "sam", text: "Oh! You're the detective, right?", voice: "intro_01" },
        { speaker: "sam", text: "I spoke to your partner earlier. He said you'd come by. I'm Sam.", voice: "intro_02" },
      ],
      set: { flagsAdd: ["talkedToSam"] },
      choices: [
        { label: "I want to talk about the wallet you found.", next: "found_wallet" },
        { label: "Have you heard anything about John's robbery?", next: "john_robbery" },
        { label: "[Leave]", next: "end" },
      ],
    },

    return_visit: {
      segments: [{ speaker: "sam", text: "Hey glad your back.", voice: "intro_04" }],
      choices: [
        { label: "Let's revisit how you found the wallet.", next: "found_wallet" },
        { label: "Remind me what you heard about John's robbery.", next: "john_robbery" },
        { label: "[Leave]", next: "good_end" },
      ],
    },

    found_wallet: {
      segments: [
        {
          speaker: "sam",
          text: "I left my house to check the mail. As I was walking, I spotted a wallet on the ground.",
          voice: "wallet_01",
        },
        { speaker: "sam", text: "I opened it open, and it was Jim's.", voice: "wallet_02" },
        { speaker: "sam", text: "After that I immediately gave it back to him. I returned it", voice: "wallet_03" },
      ],
      choices: [
        { label: "You opened it? Could it have fallen out there?", next: "return_reason" },
        { label: "Let's talk about John's robbery.", next: "john_robbery" },
        { label: "[Leave]", next: "good_end" },
      ],
    },

    return_reason: {
      segments: [{ speaker: "sam", text: "Um… I don't think so. At least, I didn't see it fall out.", voice: "falled" }],
      choices: [
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Wow. What an idiot.", next: "sam_poke_01" },
        { label: "Tell me how you found it again.", next: "found_wallet" },
        { label: "Let's talk about John's robbery.", next: "john_robbery" },
        { label: "That's all for now.", next: "good_end" },
      ],
    },

    suspicious: {
      segments: [{ speaker: "sam", text: "No… I didn't see anyone suspicious.", voice: "suspicious" }],
      set: { cluesAdd: ["sam_saw_no_one"] },
      choices: [
        { label: "Let's talk about John's robbery.", next: "john_robbery" },
        { label: "[Leave]", next: "good_end" },
      ],
    },

    sam_poke_01: {
      segments: [{ speaker: "sam", text: "Come on. There's no reason to be like that.", voice: "press_01" }],
      choices: [
        { label: "Yeah, fair. What time was this?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "You probably dropped it and someone else picked it up.", next: "direct_accuse_sam" },
        { label: "That's all for now.", next: "good_end" },
      ],
    },

    john_robbery: {
      segments: [
        { speaker: "sam", text: "I heard from Jane that John got robbed for $30.", voice: "john_01" },
        { speaker: "sam", text: "From what she told me, it sounded like a pickpocket.", voice: "john_02" },
      ],
      choices: [
        { label: "Where is Jane now?", next: "jane_where" },
        { label: "Let's talk about you finding Jim's wallet.", next: "found_wallet" },
        { label: "[Leave]", next: "good_end" },
      ],
    },

    jane_where: {
      segments: [
        {
          speaker: "sam",
          text: "She's… um. Sorry, detective. It's a pretty complicated story.",
          voice: "jane",
        },
      ],
      choices: [
        { label: "Tell me. Now.", next: "pressure_sam" },
        { label: "Take your time. I just need the truth.", next: "pressure_sam" },
        { label: "Fine. Keep it private.", next: "pressure_sam_fail" },
      ],
    },

    pressure_sam: {
      segments: [
        { speaker: "sam", text: "I— okay. I'll tell you.", voice: "tell" },
        { speaker: "sam", text: "Jane had a big argument with John last night.", voice: "where_jane_01" },
        {
          speaker: "sam",
          text: "I don't know the full details. But all I know she hasn't been back since.",
          voice: "where_jane_02",
        },
        { speaker: "sam", text: "I saw her head towards the city.", voice: "where_jane_03" },
      ],
      set: {
        cluesAdd: ["clue_sam_heard_argument", "clue_john_argument"],
        flagsAdd: ["janes_location_city"],
      },
      choices: [
        { label: "Let's go back to how you found Jim's wallet.", next: "found_wallet" },
        { label: "[Leave]", next: "good_end" },
      ],
    },

    pressure_sam_fail: {
      segments: [
        { speaker: "sam", text: "Sorry Detective but there's some things that should remain private.", voice: "no_tell" },
      ],
      choices: [
        { label: "Let's Talk about Jim's robbery", next: "found_wallet" },
        { label: "[Leave]", next: "good_end" },
      ],
    },
    direct_accuse_sam: {
      segments: [
        {
          speaker: "sam",
          text: "Detective… if you're accusing me, just say it. I'm trying to help here.",
          voice: "press_02",
        },
      ],
      choices: [
        { label: "I'm accusing you. Did you take it?", next: "accuse_sam_02" },
        { label: "Forget it. Let's move on.", next: "found_wallet" },
      ],
    },

    accuse_sam_02: {
      segments: [
        {
          speaker: "sam",
          text: "Wow. Okay. No. I didn't take anything. And if you're going to talk to me like that, we might be done here.",
          voice: "accused",
        },
      ],
      choices: [
        { label: "Apologize. I pushed too hard.", next: "" },
        { label: "Good. Then we're done here.", next: "good_end" },
      ],
    },

    good_end: {
      segments: [
        {
          speaker: "sam",
          text: "If you need anything else, detective, just ask. I hope this whole thing gets sorted out soon.",
          voice: "end",
        },
      ],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    end: {
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default samDialogue;
