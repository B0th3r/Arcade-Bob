const angry_patronDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "angry_patron",
                    text: "Damn it I can't find any flowers for my wife!",
                    voice: "intro_01"
                }, 
                {
                    speaker: "angry_patron",
                    text: "This shop sucks.",
                    voice: "intro_02"
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


export default angry_patronDialogue;
