const timDialogue = {
  start: "intro",


  nodes: {
    intro: {
      segments: [
        {
          speaker: "tim",
          text: "Detective. Make it quick. I have actual things to do.",
          voice: "intro_01"
        }
      ],
      choices: [
        { label: "I have some questions about the thefts on this street.", next: "baseline" },
        { label: "You jog mornings, right? did you see anything?", next: "jogging_start" },
        { label: "Lose the attitude, Tim.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "Know any nice restaurants near here?", next: "places" },
        { label: "I'll come back later", next: "good_end" },
      ]
    },

    return_visit: {
      segments: [
        {
          speaker: "tim",
          text: "Oh great, you're back.",
          voice: "intro_02",
        }
      ],
      choices: [
        { label: "I have some questions about the thefts on this street.", next: "baseline" },
        { label: "You jog mornings, right? did you see anything?", next: "jogging_start" },
        { label: "Lose the attitude, Tim.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "Know any nice restaurants near here?", next: "places" },
        { label: "I'll come back later", next: "good_end" },
      ]
    },
    baseline: {
      segments: [
        {
          speaker: "tim",
          text: "Oh, the missing pocket change? Riveting case. I'm sure the city will give you a medal.",
          voice: "robbery_ask"
        }
      ],
      choices: [
        { label: "Do you know any details about the robbery.", next: "robbery_detials" },
        { label: "Cut the crap and answer.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "I'll come back later", next: "good_end" },
      ]
    },

    places: {
      segments: [
        {
          speaker: "tim",
          text: "You can't afford that.",
          voice: "places_01"
        },
        {
          speaker: "tim",
          text: "How about you hangout with the other degenerates at the bar. It's in the city",
          voice: "places_02"
        }
      ],
      choices: [
        { label: "I have some questions about the thefts on this street.", next: "baseline" },
        { label: "You jog mornings, right? did you see anything?", next: "jogging_start" },
        { label: "How about you show a little respect.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "I'll come back later", next: "good_end" },
      ]
    },
    robbery_detials: {
      segments: [
        {
          speaker: "tim",
          text: "All I know is, John got robbed and Jim got robbed.",
          voice: "details_01"
        },
        {
          speaker: "tim",
          text: "Can I go now detective.",
          voice: "details_02"
        }
      ],
      choices: [
        { label: "Can you tell me more about Jim", next: "jim" },
        { label: "Do you know anything more on John", next: "john_gf_fight" },
        { label: "You seem to be in a hurry.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "I'll come back later", next: "good_end" },
      ]
    },



    jim: {
      segments: [
        {
          speaker: "tim",
          text: "Dude he's literally two steps down the block just talk to him",
          voice: "jim",

        },
      ],
      choices: [
        { label: "Do you know anything more on John", next: "john_gf_fight" },
        { label: "I'm getting tired of the disrespect Tim.", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "I'll come back later", next: "good_end" },
      ]
    },
    john_gf_fight: {
      segments: [
        {
          speaker: "tim",
          text: "Nothing much to note but He and his girlfriend were screaming at each other the day.",
          voice: "john_01",

        },
        {
          speaker: "tim",
          text: "If money went missing, I'd check her before checking me. But what do I know?",
          voice: "john_02",
        },
      ],
      set: {
        cluesAdd: ["clue_tim_heard_argument", "clue_john_argument"],
      },
      choices: [
        { label: "What exactly did you hear?", next: "argument_detail" },
        { label: "You didn't think to tell me this earlier?", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } },
        { label: "I'll come back later", next: "good_end" },
      ]
    },
    jane_info: {
      segments: [
        {
          speaker: "tim",
          text: "Jane is John's girlfriend, I think they've been living together for about four years",
          voice: "jane"
        },
      ],
      choices: [
        { label: "What exactly did you hear?", next: "argument_detail" },
        { label: "I'll come back later", next: "good_end" },
      ]
    },

    argument_detail: {
      segments: [
        {
          speaker: "tim",
          text: "Something about bills or whatever I didn't listen in for very long",
          voice: "argument_details"
        }
      ],
      choices: [
        { label: "That's all I needed", next: "good_end" },
      ]
    },



    jogging_start: {
      segments: [
        {
          speaker: "tim",
          text: "I didn't see anything, now can you go already.",
          voice: "jogging_ask_01"
        },
      ],
      set: {
        cluesAdd: ["clue_tim_saw_nothing_running"],
      },
      choices: [
        { label: "Your route passes Sam's walkway, right? Could you have seen Jim's wallet before Sam did?", next: "maybe_saw_wallet" },
        { label: "Do you know anything about the robberies themselves", next: "robbery_detials" },
        { label: "Yeah that's all I needed", next: "good_end" },
      ]
    },




    maybe_saw_wallet: {
      segments: [
        {
          speaker: "tim",
          text: "Didn't see a thing. Maybe if you did a lap around the block you'd spot something yourself.",
          voice: "jogging_ask_02",
        },
        {
          speaker: "tim",
          text: "Go on, run little doggy.",
          voice: "jogging_ask_03",
        }
      ],
      choices: [
        { label: "What can you tell me about John", next: "John" },
        { label: "What can you tell me about Jim", next: "Jim" },
        { label: "Any details on the robberies?", next: "robbery_detials" },
        { label: "I'm getting tired of the disrespect Tim", next: "__PROVOKE__", requires: { notFlags: ["tim_shutdown"] } }
      ]
    },

    tim_provoke_warn1: {
      segments: [
        {
          speaker: "tim",
          text: "Careful, Detective. If you're trying to provoke me, it's working.",
          voice: "bait_01"
        }
      ],
      choices: [
        { label: "[Continue]", next: "__PROVOKE_RETURN__" }
      ]
    },

    tim_provoke_warn2: {
      segments: [
        {
          speaker: "tim",
          text: "You're pushing it. I don't tolerate disrespect, not from neighbors, and definitely not from cops.",
          voice: "bait_02"
        }
      ],
      choices: [
        { label: "[Continue]", next: "__PROVOKE_RETURN__" }
      ]
    },

    tim_provoke_done: {
      segments: [
        {
          speaker: "tim",
          text: "We're done. Get off my porch.",
          voice: "bad_end"
        }
      ],
      set: { flagsAdd: ["tim_shutdown"] },
      choices: [
        { label: "[End conversation]", next: "end" }
      ]
    },

    shutdown: {
      segments: [
        { speaker: "tim", text: "I told you we're done. Move." }
      ],
      choices: [
        { label: "[Leave]", next: "end" }
      ]
    },


    good_end: {
      segments: [
        {
          speaker: "tim",
          text: "If we're finished, close the gate on your way out.",
          voice: "end"
        }
      ],
      end: {
        segments: [
        ],
        end: true,
        choices: []
      }
    },
    end: {
      segments: [
      ],
      end: true,
      choices: []
    }
  }
};


export default timDialogue;