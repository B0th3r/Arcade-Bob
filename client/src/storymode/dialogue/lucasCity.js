const lucasDialogue = {
    start: "intro",

    nodes: {
        intro_locked: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Oh it's you again. You better stay away from Maya!",
                    voice: "blocked",
                },
            ],
            choices: [
                { label: "[End conversation]", next: "end" },
            ]
        },

        intro: {
            gate: {
                notFlags: ["poem_failed"]
            },
            nextFail: "intro_locked",
            segments: [
                {
                    speaker: "lucas",
                    text: "Oh {{playerName}} just the person I wanted to see.",
                    voice: "intro_city_01",
                },
                {
                    speaker: "lucas",
                    text: "I need your help again.",
                    voice: "intro_city_02",
                },
                {
                    speaker: "lucas",
                    text: "I was going to buy some flowers for Maya when I realized I accidentally forgot my wallet.",
                    voice: "intro_city_03",
                },
                {
                    speaker: "lucas",
                    text: "So can you help me out again, pleaseee.",
                    voice: "intro_city_04",
                },
            ],
            choices: [
                { label: "Fine.", next: "accept" },
                { label: "Maybe later.", next: "reject" },
            ],
        },

        accept: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Thank you, detective! I'll pay you back, I swear.",
                    voice: "fetch_flower",
                },
            ],
            set: {
                flagsAdd: ["lucas_needs_flowers"]
            },
            choices: [
                { label: "[Go buy flowers]", next: "end" },
            ]
        },

        reject: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Come on, you can't leave me here!",
                    voice: "reject_flower_request",
                },
            ],
            choices: [
                { label: "Alright, fine.", next: "accept" },
                { label: "[End conversation]", next: "end" },
            ]
        },

        return_visit: {
            gate: {
                notFlags: ["flower_purchased"]
            },
            nextFail: "return_with_flowers",
            segments: [
                {
                    speaker: "lucas",
                    text: "Hey, detective.",
                    voice: "greet",
                },
            ],
            choices: [{ label: "Fine.", next: "accept" }, { label: "[End conversation]", next: "end" },]
        },
        return_with_flowers: {
            onEnter: (state) => {
                state.flags.add("cutscene_lucas_goes_to_maya");
            },
            set: {
                flagsAdd: ["flower_delivered_lucas"]
            },
            segments: [
                {
                    speaker: "lucas",
                    text: "Perfect! Alright, I'm going to go. You come with me. I saw her enter the bar a minute ago.",
                    voice: "flower_delivered",
                },
            ],
            choices: [
                { label: "Let's go", next: "" },]
        },
        flowers_to_maya_01: {
            onEnter: (state) => {
                state.flags.add("cutscene_maya_leaves");
            },
            segments: [
                {
                    speaker: "maya",
                    text: "Hey, detective",
                    voice: "maya_bar_01",
                },
                {
                    speaker: "lucas",
                    text: "Maya my love I have flowers.",
                    voice: "bar_01",
                },
                {
                    speaker: "maya",
                    text: "Oh- um- there nice but I actually like girls.",
                    voice: "maya_bar_02",
                },
                {
                    speaker: "lucas",
                    text: "Wait, what do you mean",
                    voice: "bar_02",
                },
                {
                    speaker: "lucas",
                    text: "I thought you liked my poem.",
                    voice: "bar_03",
                },
                {
                    speaker: "maya",
                    text: "It was mid at best",
                    voice: "maya_bar_03",
                },
                {
                    speaker: "maya",
                    text: "See you later.",
                    voice: "bye",
                },
            ],
            choices: [{ label: "[CONTINUE]", next: "flowers_to_maya_02" },]
        },
        flowers_to_maya_02: {
            segments: [
                {
                    speaker: "lucas",
                    text: "...",
                },
                {
                    speaker: "lucas",
                    text: "You know what, detective? This is all your fault. Maybe if you had picked better flowers, this wouldn't have happened!",
                    voice: "reject_ending_01",
                },
                {
                    speaker: "lucas",
                    text: "Damn it. all of this for nothing.",
                    voice: "reject_ending_02",
                },
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },

        end: {
            segments: [],
            end: true
        }
    }
};

export default lucasDialogue;