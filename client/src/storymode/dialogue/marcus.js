const marcusDialogue = {
  start: "intro",
  nodes: {
    intro: {
      segments: [
        { speaker: "marcus", text: "Fancy seeing you here detective...", voice: "intro_01" },
        { speaker: "marcus", text: "What are you doing here?", voice: "intro_02" },
      ],
      choices: [
        {
          label: "Bobby solved the case while you were fooling around",
          next: "broke_case",
          requires: { flagsAll: ["BobbyGood"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
        },
        {
          label: "I don't have to tell you.",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar", "fail_dirty"] },
        },
        {
          label: "My case led me here.",
          next: "case",
        },
        {
          label: "Quick, come in! Bobby is running an illegal gambling den!",
          next: "pinned_on_bobby_01",
          requires: { flagsAll: ["BobbyDirty"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
        },
        {
          label: "I came for a drink of course.",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar", "fail_dirty"] },
        },
        {
          label: "Quick, come in! Bobby and I solved the gambling den case!",
          next: "broke_case",
          requires: { flagsAll: ["BobbyGood"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
        },
        {
          label: "There's a fire in the park!",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar", "fail_dirty"] },
        },
        { label: "I just got word that Bobby needs assistance at the flower shop!", next: "sent_away", requires: { flagsAll: ["BobbyDirty"] }, set: { flagsAdd: ["marcus_sent_away"] }, },

      ],
    },

    sent_away: {
      segments: [
        { speaker: "marcus", text: "Really?", voice: "really" },
        { speaker: "marcus", text: "Well, I'll go over to the flower shop then.", voice: "sent_away" },
        {
          text: "",
          cutscene: "marcus_leaves",
        },
      ],
      choices: [
        { label: "[Leave]", next: "end_01" },
      ],
    },
    case: {
      set: { flagsAdd: ["GainedMarcusTrust"] },
      segments: [{ speaker: "marcus", text: "*sighs* I suppose that makes sense.", voice: "case" }],
      choices: [
        {
          label: "Quick, come in! Bobby is running an illegal gambling den!",
          next: "pinned_on_bobby_01",
          requires: { flagsAll: ["BobbyDirty"] },
        },
        {
          label: "Quick, come in! Bobby and I solved the gambling den case!",
          next: "broke_case",
          requires: { flagsAll: ["BobbyGood"] },
        },
        { label: "I'll be leaving now.", next: "end_01" },
      ],
    },
    pinned_on_bobby_01: {
      segments: [
        { speaker: "marcus", text: "He what!!!!", voice: "dirty_told" },
        { speaker: "marcus", text: "..." },

        { speaker: "marcus", text: "Wait this isn't adding up", voice: "not_adding", requires: { notFlags: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "What are you doing here?", voice: "intro_02", requires: { notFlags: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "Damn it Bobby.", voice: "bobbyMad", requires: { flagsAll: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "I have to see this for myself.", voice: "pinned", requires: { flagsAll: ["GainedMarcusTrust"] } },
        {
          text: "",
          cutscene: "marcus_leaves",
          requires: { flagsAll: ["GainedMarcusTrust"] }
        },

      ],
      choices: [
        {
          label: "I don't have to tell you.",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"], notFlags: ["GainedMarcusTrust"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
        },
        {
          label: "My case led me here, I was looking for Jane.",
          next: "pinned_on_bobby_02",
          requires: { notFlags: ["GainedMarcusTrust"] },
        },
        {
          label: "I came for a drink of course.",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"], notFlags: ["GainedMarcusTrust"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
        },
        {
          label: "I was patrolling the City",
          next: "failed",
          requires: { flagsAll: ["BobbyDirty"], notFlags: ["GainedMarcusTrust"] },
          set: { flagsAdd: ["marcus_comforts_bobby_bar"], },
        },
        { label: "[Leave]", next: "end_01", requires: { flagsAll: ["GainedMarcusTrust"] } },
      ],
    },
    pinned_on_bobby_02: {
      set: { flagsAdd: ["marcus_scene_complete"] },
      segments: [
        { speaker: "marcus", text: "*sighs* I suppose that makes sense.", voice: "case" },
        { speaker: "marcus", text: "Damn it Bobby.", voice: "bobbyMad" },
        { text: "(Marcus runs into the bar.)" },
        {
          text: "",
          cutscene: "marcus_leaves",
        },
      ],
      choices: [
        { label: "[Leave]", next: "end_01" },
      ],
    },
    broke_case: {
      segments: [
        { speaker: "marcus", text: "Really?", voice: "really" },
        { speaker: "marcus", text: "...", voice: "" },
        { speaker: "marcus", text: "I have to see this for myself.", voice: "pinned" },
        {
          text: "",
          cutscene: "marcus_leaves",
        },
      ],
      choices: [{ label: "[Leave]", next: "end_01" }],
    },

    failed: {
      set: { flagsAdd: ["marcus_caught", "marcus_scene_complete"] },
      segments: [
        { speaker: "marcus", text: "..." },
        { text: "(Marcus gives a disapproving look.)", requires: { flagsAll: ["fail_dirty"] } },
        { speaker: "marcus", text: "Look I know you're involved in this somehow after I interrogate Bobby I'll arrest you both.", voice: "caught", requires: { notFlags: ["fail_dirty"] } },
        { text: "(Marcus runs into the bar.)" },
        {
          text: "",
          cutscene: "marcus_leaves",
        },

      ],
      choices: [{ label: "[Leave]", next: "end_01" }],
    },

    end_01: {
      set: { flagsAdd: ["marcus_scene_complete"] },
      onEnter: (state) => {
        state.flags.add("cutscene_marcus_leaves");
      },
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default marcusDialogue;
