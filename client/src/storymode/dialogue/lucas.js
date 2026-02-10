const lucasDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Hey detective looks like you have the department all riled up",
                    voice: "intro_01",
                },
                {
                    speaker: "lucas",
                    text: "just block out the negativity.",
                    voice: "intro_02",
                },
            ],
            choices: [
                { label: "I didn't ask for your prep talk", next: "rude_open" },
                { label: "Thanks, I'll be leaving now", next: "tries_to_leave" },
            ]
        },
        return_visit: {
            segments: [
                { speaker: "lucas", text: "..." }
            ],
             choices: [{ label: "Fine I'll do it", next: "favor_accept" , requires: { notFlags: ["talkedToLucas"] },},
             { label: "[End conversation]", next: "end" }],
        },
        rude_open: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Woah man relax, I'm on your side",
                    voice: "rude",
                },
            ],
            choices: [
                { label: "I'll be leaving now", next: "tries_to_leave" },
            ]
        },
        tries_to_leave: {
            segments: [
                {
                    speaker: "lucas",
                    text: "wait, I need your help with something",
                    voice: "favor_01",
                },
            ],
            choices: [
                { label: "No, sorry.", next: "end" },
                { label: "Fine.", next: "favor_accept" },
            ]
        },
        favor_reject: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Come on please man.",
                    voice: "favor_02",
                },
            ],
            choices: [

            ]
        },
        favor_accept: {
            set: { flagsAdd: ["talkedToLucas"] },
            segments: [
                {
                    speaker: "lucas",
                    text: "thank you.",
                    voice: "thanks",
                },
                {
                    speaker: "lucas",
                    text: "Do you see Detective Maya over there? I am going to ask her out but I need some advice",
                    voice: "favor_03",
                },
                {
                    speaker: "lucas",
                    text: "I was going to give her a gift, but I have no idea what to give her. Do you have any ideas?",
                    voice: "favor_04",
                },
            ],
            choices: [
                { label: "Flowers", next: "flowers" },
                { label: "A gun", next: "gun" },
                { label: "poem", next: "poem_01" },
                { label: "A key. Women love metaphors. Trust me.", next: "key" },
                { label: "chocolate", next: "chocolate" },
            ]
        },
        flowers: {
            segments: [
                {
                    speaker: "lucas",
                    text: "flowers? I suppose that could work",
                    voice: "flowers",
                },
            ],
            choices: [
                { label: "Flowers", next: "flowers" },
                { label: "A gun", next: "gun" },
                { label: "poem", next: "poem_01" },
                { label: "A key. Women love metaphors. Trust me.", next: "key" },
                { label: "chocolate", next: "chocolate" },
            ]
        },
        gun: {
            segments: [
                {
                    speaker: "lucas",
                    text: "A gun?? Why would you say that, detective?",
                    voice: "gun_01",
                },
                {
                    speaker: "lucas",
                    text: "Are you trying to make a joke!? This is supposed to be serious.",
                    voice: "gun_02",
                },
            ],
            choices: [
                { label: "Flowers", next: "flowers" },
                { label: "A gun", next: "gun" },
                { label: "poem", next: "poem_01" },
                { label: "A key. Women love metaphors. Trust me.", next: "key" },
                { label: "chocolate", next: "chocolate" },
            ]
        },
        key: {
            segments: [
                {
                    speaker: "lucas",
                    text: "I'm not doing that, detective.",
                    voice: "key",
                },
            ],
            choices: [
                { label: "Flowers", next: "flowers" },
                { label: "A gun", next: "gun" },
                { label: "poem", next: "poem_01" },
                { label: "A key. Women love metaphors. Trust me.", next: "key" },
                { label: "chocolate", next: "chocolate" },
            ]
        },
        chocolate: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Think detective, what if she's allergic?",
                    voice: "chocolate_01",
                },
                {
                    speaker: "lucas",
                    text: "No, no that can't work.",
                    voice: "chocolate_02",
                },
            ],
            choices: [
                { label: "Flowers", next: "flowers" },
                { label: "A gun", next: "gun" },
                { label: "poem", next: "poem_01" },
                { label: "A key. Women love metaphors. Trust me.", next: "key" },
                { label: "chocolate", next: "chocolate" },
            ]
        },
        poem_01: {
            segments: [
                { speaker: "lucas", text: "A poem, oh yeah, now we're talking!", voice: "poem" },
                { speaker: "lucas", text: "Okay you have to help me write it.", voice: "poem_01" },
                { speaker: "lucas", text: "What should I say first?", voice: "poem_03" },
            ],
            choices: [
                {
                    label: "The wind moves the grass before it touches the hill.",
                    next: "poem_02",
                    set: { flagsAdd: ["poem_line1_A", "poem_line1_decent"] }
                },
                {
                    label: "I carry many words, that never leave my mouth.",
                    next: "poem_02",
                    set: { flagsAdd: ["poem_line1_B", "poem_line1_decent"] }
                },
                {
                    label: "A path does not ask who will walk it.",
                    next: "poem_02",
                    set: { flagsAdd: ["poem_line1_C", "poem_line1_perfect"] }
                },
                {
                    label: "The rain waits, for no one in particular.",
                    next: "poem_02",
                    set: { flagsAdd: ["poem_line1_R", "poem_line1_decent"] }
                },
            ]
        },

        poem_02: {
            segments: [
                { speaker: "lucas", text: "interesting… What should I write next.", voice: "poem_writing_01" }
            ],
            choices: [
                {
                    label: "I learned to wait by watching what remains.",
                    next: "poem_03",
                    set: { flagsAdd: ["poem_line2_A", "poem_line2_good"] }
                },
                {
                    label: "They grow heavy, when I see you.",
                    next: "poem_03",
                    set: { flagsAdd: ["poem_line2_B", "poem_line2_perfect"] }
                },
                {
                    label: "It only waits, to be chosen.",
                    next: "poem_03",
                    set: { flagsAdd: ["poem_line2_C", "poem_line2_good"] }
                },
                {
                    label: "Puddles form where they are allowed.",
                    next: "poem_03",
                    set: { flagsAdd: ["poem_line2_R", "poem_line2_decent"] }
                },
            ]
        },

        poem_03: {
            segments: [
                { speaker: "lucas", text: "And the last line?", voice: "poem_writing_02" }
            ],
            choices: [
                {
                    label: "If I stand here now, it is because I mean to.",
                    next: "poem_evaluate",
                    set: { flagsAdd: ["poem_line3_A", "poem_line3_perfect"] }
                },
                {
                    label: "So I set one down here.",
                    next: "poem_evaluate",
                    set: { flagsAdd: ["poem_line3_B", "poem_line3_good"] }
                },
                {
                    label: "Today, I step forward.",
                    next: "poem_evaluate",
                    set: { flagsAdd: ["poem_line3_C", "poem_line3_good"] }
                },
                {
                    label: "Some things are like that.",
                    next: "poem_evaluate",
                    set: { flagsAdd: ["poem_line3_R", "poem_line3_decent"] }
                },
            ]
        },

        poem_recite: {
            segments: [
                { text: "(continue)" },
                { speaker: "lucas", text: "Hello Detective Maya", voice: "reading_01" },
                { speaker: "maya", text: "oh, hi lucas and {{playerName}} what are you two doing here?", voice: "intro_01" },
                { speaker: "lucas", text: "I would like to read this poem to you.", voice: "reading_02" },
                { speaker: "maya", text: "Oh really? Let's hear it", voice: "intro_02" },
                { speaker: "lucas", text: "I call this the poem. The poem of love.", voice: "reading_03" },

                // Line 1
                { speaker: "lucas", text: "The wind moves the grass before it touches the hill.", voice: "poem_grass_01", requires: { flagsAll: ["poem_line1_A"] } },
                { speaker: "lucas", text: "I carry many words, that never leave my mouth.", voice: "poem_vul_01", requires: { flagsAll: ["poem_line1_B"] } },
                { speaker: "lucas", text: "A path does not ask who will walk it.", voice: "poem_path_01", requires: { flagsAll: ["poem_line1_C"] } },
                { speaker: "lucas", text: "The rain waits, for no one in particular.", voice: "poem_rain_01", requires: { flagsAll: ["poem_line1_R"] } },

                // Line 2
                { speaker: "lucas", text: "I learned to wait by watching what remains.", voice: "poem_grass_02", requires: { flagsAll: ["poem_line2_A"] } },
                { speaker: "lucas", text: "They grow heavy, when I see you.", voice: "poem_vul_02", requires: { flagsAll: ["poem_line2_B"] } },
                { speaker: "lucas", text: "It only waits, to be chosen.", voice: "poem_path_02", requires: { flagsAll: ["poem_line2_C"] } },
                { speaker: "lucas", text: "Puddles form where they are allowed.", voice: "poem_rain_02", requires: { flagsAll: ["poem_line2_R"] } },

                // Line 3
                { speaker: "lucas", text: "If I stand here now, it is because I mean to.", voice: "poem_grass_03", requires: { flagsAll: ["poem_line3_A"] } },
                { speaker: "lucas", text: "So I set one down here.", voice: "poem_vul_03", requires: { flagsAll: ["poem_line3_B"] } },
                { speaker: "lucas", text: "Today, I step forward.", voice: "poem_path_03", requires: { flagsAll: ["poem_line3_C"] } },
                { speaker: "lucas", text: "Some things are like that.", voice: "poem_rain_03", requires: { flagsAll: ["poem_line3_R"] } },

                { speaker: "lucas", text: "so, what did you think?", voice: "poem_result" },
                { speaker: "maya", text: "..." },

                // good poem path
                { speaker: "maya", text: "hm, that was actually pretty good I have to admit", voice: "good_poem_01", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "lucas", text: "Really?", voice: "really", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "maya", text: "Yeah, granted I didn't understand it but it was sweet.", voice: "decent_poem_02", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "maya", text: "I actually I have to go but lets talk more later", voice: "good_poem_02", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "lucas", text: "Okay, see you.", voice: "maya_leaves", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "lucas", text: "That went great, detective. Now I have to think about my next move", voice: "poem_result_good_01", requires: { flagsAll: ["poem_grade_good"] } },
                { speaker: "lucas", text: "Leave me.", voice: "poem_result_good_02", requires: { flagsAll: ["poem_grade_good"] } },

                // bad poem path
                { speaker: "maya", text: "that was the worst poem I have ever listened to", voice: "bad_poem_01", requires: { flagsAll: ["poem_grade_bad"] } },
                { speaker: "maya", text: "I mean seriously What did any of that even mean just get out of my face.", voice: "bad_poem_02", requires: { flagsAll: ["poem_grade_bad"] } },
                { text: "...", requires: { flagsAll: ["poem_grade_bad"] }, cutscene: "maya_leaves", },
                { speaker: "lucas", text: "Okay, see you.", voice: "maya_leaves", requires: { flagsAll: ["poem_grade_bad"] } },
                { text: "...", requires: { flagsAll: ["poem_grade_bad"] }, },
                { speaker: "lucas", text: "What the hell was that detective! You said that would have worked.", voice: "poem_result_bad_01", requires: { flagsAll: ["poem_grade_bad"] } },
            ],
            choices: [
                { label: "[Leave]", next: "end", requires: { flagsAll: ["poem_grade_good"] }, set: { flagsAdd: ["poem_passed"] } },
                { label: "Maybe you should have read it better", next: "bad_poem_fallout", requires: { flagsAll: ["poem_grade_bad"] } },
                { label: "Sorry about that.", next: "bad_end", requires: { flagsAll: ["poem_grade_bad"] } },
            ]
        },
        bad_poem_fallout: {
            segments: [
                { speaker: "lucas", text: "What-", voice: "poem_result_bad_02" },
                { speaker: "lucas", text: "You want to know what I think.", voice: "poem_result_bad_03" },
                { speaker: "lucas", text: "That you purposely sabotaged me! Because you secretly want Maya.", voice: "poem_result_bad_04" }
            ],
            choices: [
                {
                    label: "This is ridiculous, I don't want Maya.",
                    next: "bad_end",
                },
                {
                    label: "Yeah your right.",
                    next: "bad_end",
                },
            ]
        },
        bad_end: {
            segments: [
                { speaker: "lucas", text: "Whatever, I'm done here. Stay away from me, detective.", voice: "bad_end" }
            ],
            choices: [
                {
                    label: "[End conversation]",
                    next: "end",
                    set: { flagsAdd: ["poem_failed"] }
                },
            ]
        },
        poem_evaluate: {
            onEnter: (state) => {
                let qualityScore = 0;

                if (state.flags.has("poem_line1_perfect")) qualityScore += 3;
                else if (state.flags.has("poem_line1_good")) qualityScore += 2;
                else if (state.flags.has("poem_line1_decent")) qualityScore += 1;

                if (state.flags.has("poem_line2_perfect")) qualityScore += 3;
                else if (state.flags.has("poem_line2_good")) qualityScore += 2;
                else if (state.flags.has("poem_line2_decent")) qualityScore += 1;

                if (state.flags.has("poem_line3_perfect")) qualityScore += 3;
                else if (state.flags.has("poem_line3_good")) qualityScore += 2;
                else if (state.flags.has("poem_line3_decent")) qualityScore += 1;

                let coherenceBonus = 0;
                let coherencePenalty = 0;

                const hasA = [state.flags.has("poem_line1_A"), state.flags.has("poem_line2_A"), state.flags.has("poem_line3_A")];
                const hasB = [state.flags.has("poem_line1_B"), state.flags.has("poem_line2_B"), state.flags.has("poem_line3_B")];
                const hasC = [state.flags.has("poem_line1_C"), state.flags.has("poem_line2_C"), state.flags.has("poem_line3_C")];
                const hasR = [state.flags.has("poem_line1_R"), state.flags.has("poem_line2_R"), state.flags.has("poem_line3_R")];

                // perfect match
                if (hasA.every(Boolean)) coherenceBonus = 2;
                else if (hasB.every(Boolean)) coherenceBonus = 3;
                else if (hasC.every(Boolean)) coherenceBonus = 2;
                else if (hasR.every(Boolean)) coherenceBonus = 2;

                // any 2 match
                else if (
                    (hasA[0] && hasA[1]) || (hasA[1] && hasA[2]) || (hasA[0] && hasA[2]) ||
                    (hasB[0] && hasB[1]) || (hasB[1] && hasB[2]) || (hasB[0] && hasB[2]) ||
                    (hasC[0] && hasC[1]) || (hasC[1] && hasC[2]) || (hasC[0] && hasC[2]) ||
                    (hasR[0] && hasR[1]) || (hasR[1] && hasR[2]) || (hasR[0] && hasR[2])
                ) {
                    coherenceBonus = 1;
                }

                // all mismatch
                const pickedThemesCount =
                    (hasA.some(Boolean) ? 1 : 0) +
                    (hasB.some(Boolean) ? 1 : 0) +
                    (hasC.some(Boolean) ? 1 : 0) +
                    (hasR.some(Boolean) ? 1 : 0);

                if (pickedThemesCount === 3) coherencePenalty = 2;
                if (pickedThemesCount === 4) coherencePenalty = 3;

                const finalScore = qualityScore + coherenceBonus - coherencePenalty;
                if (finalScore >= 7) state.flags.add("poem_grade_good");
                else state.flags.add("poem_grade_bad");
            },
            segments: [
            ],

            choices: [
                {
                    label: "[Continue]",
                    next: "poem_feedback_01",
                },
            ]
        },
        poem_feedback_01: {
            segments: [
                {
                    speaker: "lucas",
                    text: "Okay its all done",
                    voice: "poem_writing_03",
                },
                {
                    speaker: "lucas",
                    text: "This looks amazing detective, she's bound to love it.",
                    voice: "good_poem",
                    requires: { flagsAll: ["poem_grade_good"] },
                },
                {
                    speaker: "lucas",
                    text: "Um. This seems a bit off doesn't it.",
                    voice: "bad_poem",
                    requires: { flagsAll: ["poem_grade_bad"] },
                },
            ],

            choices: [
                {
                    label: "Too easy",
                    next: "poem_feedback_02",
                    requires: { flagsAll: ["poem_grade_good"] },
                },
                {
                    label: "You should give it to Maya",
                    next: "poem_feedback_02",
                    requires: { flagsAll: ["poem_grade_decent"] },
                },
                {
                    label: "Don't worry it'll be fine",
                    next: "poem_feedback_02",
                    requires: { flagsAll: ["poem_grade_bad"] },
                }
            ]
        },
        poem_feedback_02: {
            onEnter: (state) => {
                state.flags.add("cutscene_going_to_maya");
            },
            segments: [
                { speaker: "lucas", text: "Alright I'll go read it to her, come with me", voice: "going_to_maya" },
            ],

            choices: [
                {
                    label: "[Continue]",
                    next: "poem_recite",
                    requires: { flagsAll: ["poem_grade_good"] },
                },
                {
                    label: "[Continue]",
                    next: "poem_recite",
                    requires: { flagsAll: ["poem_grade_decent"] },
                },
                {
                    label: "[Continue]",
                    next: "poem_recite",
                    requires: { flagsAll: ["poem_grade_bad"] },
                }
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

export default lucasDialogue;
