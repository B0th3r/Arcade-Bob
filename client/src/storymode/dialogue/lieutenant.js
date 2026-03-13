const lieutenantDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "lieutenant", text: "Close the door, Detective.", voice: "intro_02" },
        { speaker: "lieutenant", text: "Last case went cold. Not because we were out of options.", voice: "intro_03" },
        { speaker: "lieutenant", text: "But because you burned the one lead that mattered. ", voice: "intro_04" },
      ],
      choices: [
        { label: "I didn't burn anything.", next: "deny" },
        { label: "What lead are we talking about?", next: "explain_lead" },
        { label: "Yeah. I screwed up.", next: "admit" },
      ]
    },

    explain_lead: {
      segments: [
        { speaker: "lieutenant", text: "The witness was ready to talk then you pushed too hard.", voice: "explain_01" },
        { speaker: "lieutenant", text: "Now they've lawyered up and won't talk to us.", voice: "explain_02" },
        { speaker: "lieutenant", text: "You talked yourself out of a confession.", voice: "explain_03" },
      ],
      choices: [
        { label: "So what's my punishment?", next: "punishment" },
        { label: "I was trying to get results.", next: "deny" },
      ]
    },

    deny: {
      segments: [
        { speaker: "lieutenant", text: "Spare me. I read the report.", voice: "excuse_01" },
        { speaker: "lieutenant", text: "Careful detective if you don't take ownership with this, this can get a whole lot worse.", voice: "excuse_02" },
      ],
      choices: [
        { label: "So what now?", next: "punishment" },
        { label: "I can fix it.", next: "cant_fix" },
      ]
    },

    admit: {
      segments: [
        { speaker: "lieutenant", text: "At least you admit it. That's a start", voice: "admit" },
        { speaker: "lieutenant", text: "Our new guy Hayes has ran into some trouble with his case.  Easy neighborhood case, your job is to help out and teach.", voice: "punishment_01" },
        { speaker: "lieutenant", text: "along with that I want you to prove to me that you can be trusted around people again.", voice: "punishment_02" },
      ],
      choices: [
        { label: "Fine.", next: "end_02" },
        { label: "This seems like a punishment for Hayes too.", next: "end_01" },
      ]
    },

    cant_fix: {
      segments: [
        { speaker: "lieutenant", text: "No. You can't.", voice: "no_fix" },
        { speaker: "lieutenant", text: "Our new guy Hayes has ran into some trouble with his case.  Easy neighborhood case, your job is to help out and teach.", voice: "punishment_01" },
        { speaker: "lieutenant", text: "along with that I want you to prove to me that you can be trusted around people again.", voice: "punishment_02" },
        { speaker: "lieutenant", text: "Find detective Ace when your ready to go.", voice: "outro_01" },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_leave_office");
      },
      choices: [{ label: "[leave]", next: "end" },]
    },

    punishment: {
      segments: [
        { speaker: "lieutenant", text: "Our new guy Hayes has ran into some trouble with his case.  Easy neighborhood case, your job is to help out and teach.", voice: "punishment_01" },
        { speaker: "lieutenant", text: "along with that I want you to prove to me that you can be trusted around people again.", voice: "punishment_02" },
      ],
      choices: [
        { label: "Fine.", next: "end_02" },
        { label: "You're punishing him too.", next: "end_01" },
      ]
    },


    debrief: {
      segments: [
        { speaker: "lieutenant", text: "So Hayes gave me the rundown.", voice: "debrief_01", requires: { notFlags: ["bad_end"] } },
        { speaker: "lieutenant", text: "It looks like your suspect was-", voice: "suspect_01", requires: { flagsAny: ["mixed_end"] } },
        { speaker: "lieutenant", text: "Tim.", voice: "tim", requires: { flagsAll: ["accused_tim"], notFlags: ["accused_hayes"] } },
        { speaker: "lieutenant", text: "Sam.", voice: "sam", requires: { flagsAll: ["accused_sam"] }, },
        { speaker: "lieutenant", text: "Donna.", voice: "donna", requires: { flagsAll: ["accused_donna"] }, },
        { speaker: "lieutenant", text: "Jane.", voice: "jane", requires: { flagsAll: ["accused_jane"] }, },
        { speaker: "lieutenant", text: "I can see how you came to that conclusion.", voice: "suspect_02", requires: { flagsAny: ["mixed_end"], notFlags: ["accused_hayes"] } },
        { speaker: "lieutenant", text: "But after taking a closer look, the evidence doesn't match up at all.", voice: "suspect_03", requires: { flagsAny: ["mixed_end"], notFlags: ["accused_hayes"] } },
        { speaker: "lieutenant", text: "(sigh) This was supposed to be an easy neighborhood case, way below your pay grade. How could you screw this up?", voice: "mixed_01", requires: { flagsAny: ["mixed_end"] } },
        { speaker: "lieutenant", text: "Sounds like you caught the right guy, all of the evidence clearly pointed to John.", voice: "debrief_02", requires: { flagsAll: ["john_breaking"] }, },
        { speaker: "lieutenant", text: "Looks like you actually learned something from that last case.", voice: "debrief_05", requires: { flagsAll: ["john_breaking"] }, },
        { speaker: "lieutenant", text: "..." },
        { speaker: "lieutenant", text: "Truth is, I had Detective Marcus keeping an eye on you during the investigation.", voice: "debrief_03", requires: { notFlags: ["bad_end"] } },
        { speaker: "lieutenant", text: "Maybe if you hadn't been lollygagging, you would have found the right suspect.", voice: "mixed_03", requires: { flagsAny: ["mixed_end"] } },
        { speaker: "lieutenant", text: "I have the full report right here.", voice: "debrief_04", requires: { notFlags: ["bad_end"] } },
        { speaker: "lieutenant", text: "Uh… sounds like you were busy out there.", voice: "side_quest_01", requires: { flagsAny: ["secret_sneak_end", "sneak_end", "you_screwed_lucas", "flower_delivered_lucas"], notFlags: ["bad_end", "mixed_end"] } },
        { speaker: "lieutenant", text: "You arrested Hayes!? The same rookie you were supposed to be helping.", voice: "hayes_01", requires: { flagsAll: ["accused_hayes"] }, },
        { speaker: "lieutenant", text: "What were you thinking??", voice: "hayes_02", requires: { flagsAll: ["accused_hayes"] }, },
        { speaker: "lieutenant", text: "The florist… that's your suspect?", voice: "florist_01", requires: { flagsAll: ["accused_florist"] }, },
        { speaker: "lieutenant", text: "(sigh) Do you have anything to say for yourself?", voice: "florist_02", requires: { flagsAny: ["accused_florist"] }, },
      ],
      choices: [
        { label: "Uh, sorry?", next: "game_end", requires: { flagsAll: ["bad_end"] } },
        { label: "That florist stole it! I'm sure of it!", next: "game_end", requires: { flagsAll: ["bad_end","accused_florist"] } },
        { label: "Hayes is playing everyone for a fool! He stole the money!", next: "game_end", requires: { flagsAll: ["bad_end","accused_hayes"] } },
        { label: "Please just give me one more interview with John. I can fix this!", next: "game_end", requires: { flagsAll: ["bad_end"] } },
        { label: "What exactly did he report?", next: "debrief_02", requires: { flagsAny: ["secret_sneak_end", "sneak_end", "BobbyGood", "flower_delivered_lucas"], notFlags: ["you_screwed_lucas", "bad_end"] } },
        { label: "That Snake Marcus.", next: "debrief_02", requires: { flagsAny: ["secret_sneak_end", "sneak_end", "BobbyGood", "flower_delivered_lucas"], notFlags: ["you_screwed_lucas", "bad_end"] } },
        { label: "What exactly did he report?", next: "maya", requires: { flagsAll: ["you_screwed_lucas"], notFlags: ["bad_end"] }, },
        { label: "That Snake Marcus.", next: "game_end", requires: { notFlags: ["you_screwed_lucas", "bad_end", "secret_sneak_end", "sneak_end", "BobbyGood", "flower_delivered_lucas"] } },
        { label: "What exactly did he report?", next: "game_end", requires: { notFlags: ["you_screwed_lucas", "bad_end", "secret_sneak_end", "sneak_end", "BobbyGood", "flower_delivered_lucas"] } },
      ]
    },
    debrief_02: {
      segments: [
        { speaker: "lieutenant", text: "Unbelievable, moving on.", voice: "maya_admit", requires: { flagsAll: ["maya_admit"] } },
        { speaker: "lieutenant", text: "I don't even know where to begin.", voice: "side_quest_02", requires: { notFlags: ["you_screwed_lucas"] } },
        { speaker: "lieutenant", text: "Moving on.", voice: "maya_reject", requires: { flagsAll: ["maya_reject"] } },
        { speaker: "lieutenant", text: "You went on some sort of wild goose chase over an item called “The Big Sneak.”", voice: "big_sneak_01", requires: { flagsAny: ["secret_sneak_end", "sneak_end"] }, },
        { speaker: "lieutenant", text: "I get that you want to help out, but you really should be focusing on the main case.", voice: "big_sneak_02", requires: { flagsAny: ["secret_sneak_end", "sneak_end"] }, },
        { speaker: "lieutenant", text: "You attempted to help Lucas with his… love life.", voice: "lucas", requires: { flagsAll: ["flower_delivered_lucas"] } },
        { speaker: "lieutenant", text: "Marcus was very pleased to hear that you helped Bobby bring down the hidden gambling operation.", voice: "bobby", requires: { flagsAll: ["BobbyGood"] } },
      ],
      choices: [
        { label: "Noted.", next: "game_end" },
        { label: "Roger that.", next: "game_end" },
      ]
    },
    maya: {
      segments: [
        { speaker: "lieutenant", text: "I don't even know where to begin.", voice: "side_quest_02" },
        { speaker: "lieutenant", text: "During the investigation, you made a move on Detective Maya. That is beyond unprofessional.  Do you have anything to say for yourself?", voice: "maya", requires: { flagsAll: ["you_screwed_lucas"] } },
      ],
      choices: [
        { label: "I was out of line. It won't happen again.", next: "debrief_02", set: { flagsAdd: ["maya_admit"] } },
        { label: "That's not what happened. Marcus is a liar.", next: "debrief_02", set: { flagsAdd: ["maya_reject"] } },
      ]
    },

    game_end: {
      segments: [
        { speaker: "lieutenant", text: "You did some great work", voice: "good_04", requires: { flagsAll: ["john_breaking"] } },
        { speaker: "lieutenant", text: "It seems that the last case has truly changed you.", voice: "mixed_02", requires: { flagsAny: ["john_breaking", "mixed_end"] } },
        { speaker: "lieutenant", text: "From now on, Marcus will sign off on every move you make.", voice: "mixed_04", requires: { flagsAny: ["mixed_end"] } },
        { speaker: "lieutenant", text: "Get out of my office. You're fired.", voice: "fired", requires: { flagsAny: ["accused_florist", "accused_hayes"] } },
        { speaker: "lieutenant", text: "You may have gotten sidetracked on the way but You did some great work", voice: "good_03", requires: { flagsAny: ["secret_sneak_end", "sneak_end", "you_screwed_lucas", "flower_delivered_lucas"], notFlags: ["bad_end"] } },
        { speaker: "lieutenant", text: "I think I can trust you around people again.", voice: "good_01", requires: { flagsAll: ["john_breaking"] } },
        { speaker: "lieutenant", text: "Come see me tomorrow. I've got a bigger case waiting for you", voice: "good_02", requires: { flagsAll: ["john_breaking"] } },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02", requires: { notFlags: ["bad_end"] } },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_ending_master");
      },
      choices: [
        { label: "[leave]", next: "end", requires: { flagsAny: ["bad_end"] } },
        { label: "I won't let you down.", next: "end", requires: { flagsAll: ["john_breaking"] } },
        { label: "See you tomorrow.", next: "end", requires: { flagsAll: ["john_breaking"] } },
        { label: "Understood.", next: "end", requires: { flagsAny: ["mixed_end"] } },
        { label: "[leave without a word]", next: "end", requires: { flagsAny: ["mixed_end"] } },
      ]
    },

    end_01: {
      segments: [
        { speaker: "lieutenant", text: "No. I'm protecting him and I'm testing you.", voice: "rookie_pushback" },
        { speaker: "lieutenant", text: "Find detective Ace when your ready to go", voice: "outro_01" },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02" },
      ],

      onEnter: (state) => {
        state.flags.add("cutscene_leave_office");
      },
      choices: [{ label: "[leave]", next: "end" },]
    },

    end_02: {
      segments: [
        { speaker: "lieutenant", text: "Find detective Ace when your ready to go.", voice: "outro_01" },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02" },
      ],

      onEnter: (state) => {
        state.flags.add("cutscene_leave_office");
      },
      choices: [{ label: "[leave]", next: "end" },]
    },

    end: {
      segments: [],
      end: true,
      choices: []
    }
  }
};
export default lieutenantDialogue;