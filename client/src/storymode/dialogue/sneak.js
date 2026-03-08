const sneakDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    text: "(Hm? Whats this thing)",
                },
                {
                    text: "(Wait, could this be The Big Sneak?)",
                    requires: { flagsAll: ["big_sneak_active"] }
                },
            ],
            choices: [
                { label: "[Take it.]", next: "took", requires: { notFlags: ["big_sneak_active"] } },
                { label: "[Callover Frank]", next: "frank", requires: { flagsAll: ["big_sneak_active"]} },
                { label: "[Leave it.]", next: "end" },
            ]
        },
        frank: {
             set: {
                flagsAdd: ["secret_sneak_end"]
            },
            segments: [
                {
                    text: "(I'll call him over)",
                },
                {
                    text: "",
                    cutscene: "frank_comes",
                },
                {
                    speaker: "frank",
                    text: "You really found it. I would have never looked here.",
                    voice: "found_01"
                },
                {
                    speaker: "frank",
                    text: "Thank you so much, officer.",
                    voice: "found_02"
                },
            ],
            choices: [
                { label: "[End conversation]", next: "end" },
            ]
        },
        took: {
            set: {
                flagsAdd: ["found_sneak"]
            },
            segments: [
                {
                    text: "(You took the mysterious item)",
                },
                {
                    text: "",
                    cutscene: "sneak_taken",
                },
            ],
            choices: [
                { label: "[Leave]", next: "end" },
            ]
        },
        end: {
            segments: [
            ],
            end: true,
            choices: []
        }
    }
};


export default sneakDialogue;
