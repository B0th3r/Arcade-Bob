const lostManDialogue = {
    start: "intro",
    nodes: {
        intro: {
            segments: [
                {
                    speaker: "lost_man",
                    text: "Hey officer, I need some help.",
                    voice: "intro_01"
                },
                {
                    speaker: "lost_man",
                    text: "Which way to the nearest bar",
                    voice: "intro_02"
                }
            ],
            choices: [
                { label: "Down the street, to the left.", next: "intro_02", set: { flagsAdd: ["helped_lost_man"] } },
                { label: "Down the street and keep going right. (lie)", next: "intro_02", set: { flagsAdd: ["mislead_lost_man"] } },
            ]
        },
        intro_02: {
            segments: [
                {
                    speaker: "lost_man",
                    text: "Great thanks!",
                    voice: "intro_03"
                },
                {
                    text: "",
                    cutscene: "lost_man_leaves",
                },
            ],
            choices: [
                { label: "[End conversation]", next: "end" },
            ]
        },
        return_visit: {
            segments: [
                {
                    speaker: "lost_man",
                    text: "yo",
                    voice: "yo"
                },
            ],
            choices: [
                { label: "[End conversation]", next: "end" },
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


export default lostManDialogue;
