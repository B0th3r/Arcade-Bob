const frankDialogue = {
    start: "intro",
    nodes: {
        intro: {
            segments: [
                {
                    speaker: "frank",
                    text: "Hey, you. Come here.",
                    voice: "intro_01"
                }
            ],
            choices: [
                { label: "[Walk towards him.]", next: "intro_02" },
                { label: "[End conversation]", next: "end" },
            ]
        },

        intro_02: {
            set: {
                flagsAdd: ["big_sneak_active"]
            },
            segments: [
                {
                    speaker: "frank",
                    text: "Have you heard of the big sneak?",
                    voice: "intro_02"
                }
            ],
            choices: [
                { label: "I have", next: "heard", requires: { notFlags: ["found_sneak"] } },
                { label: "Nope I haven't", next: "info", requires: { notFlags: ["found_sneak"] } },
                { label: "I actually found it already", next: "secret_end", requires: { flagsAll: ["found_sneak"] } },
            ]
        },
        info: {
            segments: [
                {
                    speaker: "frank",
                    text: "No one has ever seen it, but apparently, it brings great fortune to whoever holds it.",
                    voice: "info_01",
                },
                {
                    speaker: "frank",
                    text: "You're a cop, right? Help me out.",
                    voice: "info_02",
                },
            ],
            choices: [
                { label: "How many people know about this?", next: "know" },
                { label: "What else do you know about it?", next: "info_02" },
                { label: "I'll think about it.", next: "end" }
            ]
        },
        secret_end: {
            set: {
                flagsAdd: ["secret_sneak_end"]
            },
            segments: [
                {
                    speaker: "frank",
                    text: "What!? How is that possible!?",
                    voice: "secret_01",
                },
                {
                    speaker: "frank",
                    text: "I see what's happening here. This is obviously a fake.",
                    voice: "secret_02",
                },
                  {
                    speaker: "frank",
                    text: "You're a scam artist, get away from me!",
                    voice: "secret_03",
                },
            ],
            choices: [
               { label: "[End conversation]", next: "end" }
            ]
        },
        heard: {
            segments: [
                {
                    speaker: "frank",
                    text: "Perfect, you have to help me find it.",
                    voice: "know",
                }
            ],
            choices: [
                { label: "How many people know about this?", next: "know" },
                { label: "What else do you know about it?", next: "info_02" },
                { label: "I'll think about it.", next: "end" }
            ]
        },

        know: {
            segments: [
                {
                    speaker: "frank",
                    text: "Everyone, man!",
                    voice: "heard",
                }
            ],
            choices: [
                { label: "How many people know about this?", next: "know" },
                { label: "What else do you know about it?", next: "info_02" },
                { label: "I'll think about it.", next: "end" }
            ]
        },
        info_02: {
            segments: [
                {
                    speaker: "frank",
                    text: "Not much, there really isn't too much information on it.",
                    voice: "info_03"
                }
            ],
            choices: [
                { label: "How many people know about this?", next: "know" },
                { label: "What else do you know about it?", next: "info_02" },
                { label: "I'll think about it.", next: "end" }
            ]
        },
        return_visit: {
            segments: [
                {
                    speaker: "frank",
                    text: "...",
                }
            ],
            choices: [
                { label: "How many people know about this?", next: "know", requires: { notFlags: ["secret_sneak_end"] }},
                { label: "What else do you know about it?", next: "info_02", requires: { notFlags: ["secret_sneak_end"] } },
                { label: "Bye.", next: "end" }
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


export default frankDialogue;
