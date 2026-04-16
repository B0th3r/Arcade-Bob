const tutorialDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                { speaker: "ace", text: "The lieutenant wants to talk to you.", voice: "tutorial_02" },
                { speaker: "ace", text: "I'm sure you already know why.  He's inside the office.", voice: "tutorial_03" },
            ],
            choices: [
                { label: "(Go inside)", next: "office", set: { flagsAdd: ["talkedToAce"] } },
            ]
        },
        office: {
            segments: [
                {
                    text: "",
                    cutscene: "intro_office",
                },
            ],
            choices: [
                { label: "continue", next: "end_01" },
            ]
        },
        call_out: {
            segments: [
               { speaker: "ace", text: "Hey, get over here!",voice: "tutorial_01"},
            ],
            choices: [
                { label: "Okay.", next: "end_01" },
                { label: "Roger.", next: "end_01" },
            ]
        },
        end_01: {
            segments: [
            ],
            end: true,

            choices: []
        },
    }
};

export default tutorialDialogue;
