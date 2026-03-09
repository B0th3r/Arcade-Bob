const happy_patronDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "happy_patron",
                    text: "I love this shop.",
                    voice: "shop_bark"
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


export default happy_patronDialogue;
