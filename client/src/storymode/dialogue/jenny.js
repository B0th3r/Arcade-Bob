const jennyDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "jenny",
                    text: "Sorry I can't talk now.",
                    voice: "pd_bark"
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


export default jennyDialogue;
