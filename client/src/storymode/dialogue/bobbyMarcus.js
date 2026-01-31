const bobbyMarcusDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "Bobby",
                    text: "...",
                }
            ],
            choices: [
                { label: "Hello?", next: "cant_speak" },
                { label: "[Leave]", next: "end_02" },
            ]
        },

        cant_speak: {
            segments: [
                {
                    speaker: "Bobby",
                    text: "Um—sorry, they said I couldn't speak to you.",
                    voice: "intro_01",
                }
            ],
            choices: [
                { label: "Who said that?", next: "who" },
                { label: "[End conversation]", next: "end_02" },
            ]
        },
        who: {
            segments: [
                {
                    speaker: "bobby",
                    text: "Detective Marcus did.",
                    voice: "who",
                },
                {
                    speaker: "bobby",
                    text: "He gave me a briefing and everything.",
                    voice: "lying_02",
                },
            ],
            set: { flagsAdd: ["HasMetBobby"] },
            choices: [
                { label: "That sounds like a lie.", next: "lying" },
                { label: "Alright. I'm leaving.", next: "late_leave" },
            ]
        },
        lying: {
            segments: [
                {
                    speaker: "bobby",
                    text: "No, I'm not lying. I swear—ask him yourself.",
                    voice: "lying_01",
                },
                {
                    speaker: "marcus",
                    text: "Detective Bobby!",
                    voice: "marcus_entrance_01",
                },
                {
                    speaker: "bobby",
                    text: "Wow. Great. Just great.",
                    voice: "marcus_appers",
                },
                {
                    text: "",
                    cutscene: "marcus_enters",
                },
                {
                    speaker: "marcus",
                    text: "I thought I told you not to speak with him.",
                    voice: "marcus_entrance_02",
                },
                {
                    speaker: "bobby",
                    text: "I know, but—",
                    voice: "rep",
                },
                {
                    speaker: "marcus",
                    text: "No buts! Just go!",
                    voice: "marcus_entrance_03",
                },
                {
                    speaker: "bobby",
                    text: "Okay.",
                    voice: "leaves",
                },
            ],
            set: { flagsAdd: ["HasMetBobby"] },
            choices: [
                {
                    label: "Seems like a bit of an overreaction.",
                    next: "overreacted",
                    set: { flagsAdd: ["asked_overreacted"] },
                    requires: { notFlags: ["asked_overreacted"] }
                },
                {
                    label: "What did you tell him?",
                    next: "explanation",
                    set: { flagsAdd: ["asked_explanation"] },
                    requires: { notFlags: ["asked_explanation"] }
                },
                {
                    label: "Relax, Marcus. Some of us actually get results.",
                    next: "taunted",
                    set: { flagsAdd: ["did_taunt"] },
                    requires: { notFlags: ["did_taunt"] }
                },
                {
                    label: "You're just mad I get things done.",
                    next: "mad_end",
                    requires: { flagsAll: ["did_taunt"] }
                },
                { label: "[Leave]", next: "end" },
            ]

        },
        late_leave: {
            segments: [
                {
                    speaker: "bobby",
                    text: "Please just leave me be. I don't want to lose my job.",
                    voice: "job",
                },
                {
                    speaker: "marcus",
                    text: "Detective Bobby!",
                    voice: "marcus_entrance_01",
                },
                {
                    speaker: "bobby",
                    text: "Wow. Great. Just great.",
                    voice: "marcus_appers",
                },
                {
                    text: "",
                    cutscene: "marcus_enters",
                },
                {
                    speaker: "marcus",
                    text: "I thought I told you not to speak with him.",
                    voice: "marcus_entrance_02",
                },
                {
                    speaker: "bobby",
                    text: "I know, but—",
                    voice: "rep",
                },
                {
                    speaker: "marcus",
                    text: "No buts! Just go!",
                    voice: "marcus_entrance_03",
                },
                {
                    speaker: "bobby",
                    text: "Okay.",
                    voice: "leaves",
                },
            ],
            choices: [
                {
                    label: "Seems like a bit of an overreaction.",
                    next: "overreacted",
                    set: { flagsAdd: ["asked_overreacted"] },
                    requires: { notFlags: ["asked_overreacted"] }
                },
                {
                    label: "What did you tell him?",
                    next: "explanation",
                    set: { flagsAdd: ["asked_explanation"] },
                    requires: { notFlags: ["asked_explanation"] }
                },
                {
                    label: "Relax, Marcus. Some of us actually get results.",
                    next: "taunted",
                    set: { flagsAdd: ["did_taunt"] },
                    requires: { notFlags: ["did_taunt"] }
                },
                {
                    label: "You're just mad I get things done.",
                    next: "mad_end",
                    requires: { flagsAll: ["did_taunt"] }
                },
                { label: "[Leave]", next: "end" },
            ]

        },
        overreacted: {
            segments: [
                {
                    speaker: "marcus",
                    text: "No, I'm not overreacting.",
                    voice: "overreact_01",
                },
                {
                    speaker: "marcus",
                    text: "I've seen what happens to rookies who learn your way.",
                    voice: "overreact_02",
                },
                {
                    speaker: "marcus",
                    text: "And I won't have it with Bobby, so stay away from him.",
                    voice: "overreact_03",
                },

            ],
            choices: [
                {
                    label: "What did you tell him?",
                    next: "explanation",
                    set: { flagsAdd: ["asked_explanation"] },
                    requires: { notFlags: ["asked_explanation"] }
                },
                {
                    label: "Relax, Marcus. Some of us actually get results.",
                    next: "taunted",
                    set: { flagsAdd: ["did_taunt"] },
                    requires: { notFlags: ["did_taunt"] }
                },
                {
                    label: "You're just mad I get things done.",
                    next: "mad_end",
                    requires: { flagsAll: ["did_taunt"] }
                },
                { label: "[Leave]", next: "end" },
            ]

        },
        taunted: {
            segments: [
                {
                    speaker: "marcus",
                    text: "See! This is exactly what I'm talking about—no respect at all.",
                    voice: "taunted_01",
                },
                {
                    speaker: "marcus",
                    text: "If I were the lieutenant, I would've had you fired months ago. People like you give cops a bad name.",
                    voice: "taunted_02",
                },
            ],
            choices: [
                {
                    label: "Seems like a bit of an overreaction.",
                    next: "overreacted",
                    set: { flagsAdd: ["asked_overreacted"] },
                    requires: { notFlags: ["asked_overreacted"] }
                },
                {
                    label: "What did you tell him?",
                    next: "explanation",
                    set: { flagsAdd: ["asked_explanation"] },
                    requires: { notFlags: ["asked_explanation"] }
                },
                {
                    label: "You're just mad I get things done.",
                    next: "mad_end",
                    requires: { flagsAll: ["did_taunt"] }
                },
                { label: "[Leave]", next: "end" },
            ]

        },
        explanation: {
            segments: [
                {
                    speaker: "marcus",
                    text: "I told him nothing good will come from hanging out with the likes of you.",
                    voice: "explain_01",
                },
                {
                    speaker: "marcus",
                    text: "I wouldn't want him picking up any bad habits.",
                    voice: "explain_02",
                },
            ],
            choices: [
                {
                    label: "Seems like a bit of an overreaction.",
                    next: "overreacted",
                    set: { flagsAdd: ["asked_overreacted"] },
                    requires: { notFlags: ["asked_overreacted"] }
                },
                {
                    label: "What did you tell him?",
                    next: "explanation",
                    set: { flagsAdd: ["asked_explanation"] },
                    requires: { notFlags: ["asked_explanation"] }
                },
                {
                    label: "Relax, Marcus. Some of us actually get results.",
                    next: "taunted",
                    set: { flagsAdd: ["did_taunt"] },
                    requires: { notFlags: ["did_taunt"] }
                },
                {
                    label: "You're just mad I get things done.",
                    next: "mad_end",
                    requires: { flagsAll: ["did_taunt"] }
                },
                { label: "[Leave]", next: "end" },
            ]
        },
        mad_end: {
            segments: [
                {
                    speaker: "marcus",
                    text: "You get things—no. I'm done with this. Tread very carefully, detective.",
                    voice: "mad_end",
                },
            ],
            choices: [{ label: "[End conversation]", next: "end_01" },]
        },
        end: {
            segments: [
                {
                    speaker: "marcus",
                    text: "Good riddance. And stay away from Bobby!",
                    voice: "end",
                },

            ],
            choices: [{ label: "[End conversation]", next: "end_01" },]
        },
        end_01: {
            segments: [
            ],
            end: true,
            endCutscene: "bobby_leaves",
            choices: []
        },
        end_02: {
            segments: [
            ],
            end: true,
            choices: []
        },
    }
};

export default bobbyMarcusDialogue;
