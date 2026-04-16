const aceDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                { speaker: "ace", text: "{{playerName}}, are you ready to go?", voice: "intro_01" },
                { text: "If you say YES, you'll start the investigation and won't be able to return to the police department." },
            ],
            choices: [
                { label: "Yes", next: "start_investigation" },
                { label: "Not yet.", next: "end_01" },
            ]
        },
        start_investigation: {
            set: { flagsAdd: ["started_investigation"] },
            segments: [
                { speaker: "ace", text: "Okay, good luck.", voice: "intro_02" },
            ],
            onEnter: (state) => {
                state.flags.add("cutscene_leave_pd");
            },
            choices: [
                { label: "continue", next: "" },
            ]
        },
        arrested: {
            segments: [
                { speaker: "ace", text: "(sigh) Well, I didn't think we'd end up here.", voice: "arrested_01" },
                { speaker: "ace", text: "Why did you do it?", voice: "arrested_02" },
            ],
            choices: [
                { label: "I don't know.", next: "arrested_02", },
                { label: "You wouldn't understand.", next: "arrested_02" },
                { label: "Marcus is lying.", next: "arrested_02", set: { flagsAdd: ["accused_liar"] } },
            ]
        },
        arrested_02: {
            segments: [
                { speaker: "ace", text: "...", requires: { notFlags: ["accused_liar"] }, },
                { speaker: "ace", text: "No, he isn't.", voice: "marcus_01", requires: { flagsAll: ["accused_liar"] }, },
                { speaker: "ace", text: "The truth is, the lieutenant had Detective Marcus tailing you the entire investigation.", voice: "marcus_02" },
                { speaker: "ace", text: "We know everything.", voice: "marcus_03" },
                { speaker: "ace", text: "Are you ready to hear your charges?", voice: "charge_01" },
            ],
            choices: [
                { label: "(Stay silent)", next: "arrested_charges" },
                { label: "Yes, I'm ready.", next: "arrested_charges" },
            ]
        },
        arrested_charges: {
            segments: [
                { speaker: "ace", text: "Bribery under color of law. Extortion.  You were caught taking bribes from the bar's illegal gambling ring", voice: "charge_02" },
                { speaker: "ace", text: "And then there's Hayes. You attempted a false arrest of a fellow officer. That's obstruction and abuse of authority.", voice: "charge_03", requires: { flagsAll: ["accused_hayes"] } },
                { speaker: "ace", text: "With everything stacked against you…", voice: "charge_04" },
                { speaker: "ace", text: "They're looking at 10 years in the joint.", voice: "charge_05" },
                { speaker: "ace", text: "I'm sorry it went this way.", voice: "charge_06" },
            ],
            onEnter: (state) => {
                state.flags.add("cutscene_ending_master");
            },
            choices: [
                { label: "[END GAME]", next: "end" },
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

export default aceDialogue;
