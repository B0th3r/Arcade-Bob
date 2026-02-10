const floristDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "florist",
          text: "Welcome to the Bloom Room! Whoa, serious face. You're not here for a bouquet, are you?",
          voice: "intro_01"
        }
      ],
      choices: [
        { label: "I'm investigating something that happened the other night.", next: "case_intro" },
        { label: "what do you have in stock?", next: "browse", requires: { notFlags: ["flower_purchased"] }, },
        { label: "I hate flowers", next: "rude_open" },
        { label: "[End conversation]", next: "end" },
      ]
    },

    rude_open: {
      segments: [
        {
          speaker: "florist",
          text: "Hmph! a flower hater get out of my store!",
          voice: "rude_open"
        }
      ],
      choices: [
        { label: "Wait! I was joking", next: "rude_recovery" },
        { label: "Whatever", next: "end" }
      ]
    },
    rude_recovery: {
      segments: [
        {
          speaker: "florist",
          text: "Oh you were just joking, thank golly.",
          voice: "rude_open_save",
        }
      ],
      choices: [
        { label: "Have you seen anyone suspicious lately", next: "suspicious" },
        { label: "what do you have in stock?", next: "browse", requires: { notFlags: ["flower_purchased"] }, },
        { label: "Jk still hate flowers", next: "rude_end" },
        { label: "I'll be leaving now", next: "end_soft" }
      ]
    },
    rude_end: {
      segments: [
        {
          speaker: "florist",
          text: "How rude! that's it I am ignoring you.",
          voice: "rude_end",
        }
      ],
      choices: [{ label: "[End conversation]", next: "end" },]
    },

    case_intro: {
      segments: [
        {
          speaker: "florist",
          text: "Ooooh okay, mystery face on! Okay, hit me. Flower boy is ready.",
          voice: "investagtion_start",
        }
      ],
      choices: [

        { label: "what do you have in stock?", next: "browse", requires: { notFlags: ["flower_purchased"] }, },
        { label: "Have you seen anyone suspicious lately", next: "suspicious" },
        { label: "I'll be leaving now", next: "end_soft" }
      ]
    },
    browse: {
      segments: [
        {
          speaker: "florist",
          text: "Tell me, what type of flowers are you looking for sweetie",
          voice: "flower_browse"
        }
      ],
      choices: [{ label: "What's the cheapest thing in here?", next: "florist_cheapest_item" },
      { label: "I need something for my mom", next: "florist_mother_item" },
      { label: "That's enough, sorry to bother you.", next: "end_soft" }
      ]
    },


    suspicious: {
      segments: [
        {
          speaker: "florist",
          text: "Anyone one suspicious? Nope, can't say I have sweetie.",
          voice: "suspicious",
        }
      ],
      choices: [
        { label: "what do you have in stock?", next: "browse", requires: { notFlags: ["flower_purchased"] }, },
        { label: "I'll be leaving now", next: "end_soft" }
      ]
    },
    florist_cheapest_item: {
      segments: [
        {
          speaker: "florist",
          text: "That would be this bouquet of Sunflowers, for 15$ they'll brighten up anyone's day.",
          voice: "sunflower",
        }
      ],
      choices: [
        { label: "(Purchase the Sunflowers)", next: "purchased" },
        { label: "I'll be leaving now", next: "end_soft" }
      ]
    },
    florist_mother_item: {
      segments: [
        {
          speaker: "florist",
          text: "For your mother I would choose this bouquet of Tulips",
          voice: "tulips",
        }
      ],
      choices: [
        { label: "(Purchase the Tulips)", next: "purchased" },
        { label: "I'll be leaving now", next: "end_soft" }
      ]
    },
    purchased: {
      set: { flagsAdd: ["flower_purchased"] },
      segments: [
        {
          speaker: "florist",
          text: "(You have purchased flowers)",
        }
      ],
      choices: [{ label: "[End conversation]", next: "end" },
      { label: "I'm investigating something that happened the other night.", next: "case_intro" },
      ]
    },




    end_soft: {
      segments: [
        {
          speaker: "florist",
          text: "Alright sweetie, go do your detective thing. Come back if you need fresh air and fresh petals.",
          voice: "end",
        }
      ],
      choices: [{ label: "[End conversation]", next: "end" },]
    },
    end: {
      segments: [
      ],
      end: true,
      choices: []
    }
  }
};


export default floristDialogue;



