# Mental Models Deck

A swipeable and flippable mental-models app built with React, TypeScript, and Vite.

Live app: [https://seymores.github.io/mental-models/](https://seymores.github.io/mental-models/)

## App Features
1. Swipe left/right navigation through a stacked card deck.
2. Tap-to-flip cards: front for headline, back for details (principle, concept, example, action).
3. Related-model tags on card back that jump directly to the selected model.
4. Searchable index modal for fast title lookup and direct navigation.
5. Virtual introduction card in index position `0` with a `Thank you` message and repository link.
6. Category-based visual theming (People, Process, Product) used across cards and index badges.
7. Progress indicators showing current position in the deck.
8. In-app update detection with a `Load now` action when fresher deck data is available.
9. Portrait-only guard for phone landscape mode to preserve reading layout.
10. PWA support (manifest + service worker) for installable, cache-friendly delivery.

## 3P Categorization (People, Process, Product)
The deck organizes every model under a single 3P category:

1. **People (124)**: Mental models about human behavior, cognition, judgment, communication, incentives, and social dynamics.
2. **Process (59)**: Mental models about decision-making workflows, problem-solving methods, systems thinking, and execution frameworks.
3. **Product (77)**: Mental models about markets, strategy, competition, product economics, adoption, and value creation.

In the app, these categories are used for theme styling and for deck composition/interleaving behavior so browsing is not dominated by a single category sequence.

## Mental Model Catalog (260)

### People (124)
1. Actor-Observer Bias
2. Affect Heuristic
3. Affective Forecasting
4. Anchoring Bias
5. Appeal to Authority
6. Assumption of Positive Intent
7. Attractiveness Bias
8. Authority Bias
9. Automaticity
10. Availability Heuristic
11. Bandwagon Effect
12. Base Rate Fallacy
13. Beginner's Mind
14. Bystander Effect
15. Choice Architecture
16. Chunking
17. Cognitive Biases
18. Cognitive Dissonance
19. Cognitive Empathy
20. Commitment and Consistency
21. Commitment Bias
22. Conformity
23. Conjunction Fallacy
24. Context Dependence
25. Conway's Law
26. Counterfactual Thinking
27. Credentials vs. Knowledge
28. Curse of Knowledge
29. Deathbed Test
30. Decision Fatigue
31. Default Effect
32. Desirable Difficulties
33. Dilbert Principle
34. Dissent Suppression
35. Dunning-Kruger Effect
36. Ego Depletion
37. Egocentric Bias
38. Elaborative Rehearsal
39. Empathy
40. Endowment Effect
41. Epistemic Humility
42. Escalation of Commitment
43. False Consensus Effect
44. Familiarity Bias
45. Filter Bubble
46. Foot-in-the-Door Technique
47. Forgetting Curve
48. Fundamental Attribution Error
49. Goodhart's Law
50. Groupthink
51. Growth Mindset vs. Fixed Mindset
52. Guilford's Alternate Uses
53. Halo Effect
54. Hanlon's Razor
55. Hedonic Framing
56. Herding Behavior
57. Hindsight Bias
58. Horn Effect
59. Hot-Cold Empathy Gap
60. Hyperbolic Discounting
61. IKEA Effect
62. Illusion of Transparency
63. Illusory Superiority
64. Impostor Syndrome
65. In-Group Bias
66. Inferential Distance
67. Informational Cascades
68. Interleaving
69. Just-World Hypothesis
70. Learned Helplessness
71. Liking Bias
72. Locus of Control
73. Loss Aversion
74. Media Bias
75. Mental Accounting
76. Mental Bandwidth
77. Mere Exposure Effect
78. Narrative Fallacy
79. Negative Visualization
80. Neglect of Probability
81. Not Invented Here Syndrome
82. Nudge Theory
83. Obligation
84. Optimism Bias
85. Outcome Bias
86. Overconfidence Effect
87. Pedagogical Gap
88. Peter Principle
89. Planning Fallacy
90. Pluralistic Ignorance
91. Preference Falsification
92. Priming
93. Prior Probability
94. Projection Bias
95. Prospect Theory
96. Psychological Ownership
97. Reactance
98. Recency Bias
99. Reciprocity
100. Regret Aversion
101. Representativeness Heuristic
102. Salience Bias
103. Satisficing
104. Satisficing vs. Maximizing
105. Scarcity Mindset
106. Selection Bias
107. Self-Efficacy
108. Self-Fulfilling Prophecy
109. Similarity-Attraction
110. Situational vs. Dispositional Attribution
111. Social Anxiety
112. Social Proof
113. Spacing Effect
114. Spiral of Silence
115. Spotlight Effect
116. State-Dependent Memory
117. Status Quo Bias
118. Steel-manning vs. Straw-manning
119. Streetlight Effect
120. Sunk Cost Fallacy
121. Survivorship Bias
122. System 1 vs System 2
123. Winning Streak
124. Zone of Proximal Development

### Process (58)
1. 3Ms: Muda, Mura, and Muri
2. 3P Framework (People, Process, Product)
3. 5-5-5 Rule
4. ABT (And/But/Therefore)
5. Asymmetric Risk
6. Bayesian Thinking
7. Brooks's Law
8. Chesterton's Fence
9. Circle of Competence
10. Compound Growth
11. Conditional Probability
12. Constraint Relaxation
13. Continuous Improvement
14. Critical Path
16. Eisenhower Matrix
17. Emergence
18. Expected Value
19. Feedback Loops
20. First Principles Thinking
21. Homeostasis
22. Inversion
23. Jidoka (Automation/Quality at the source)
24. Kaizen (Continuous Improvement)
25. Lateral Thinking
26. Leverage Points
27. Lindy Effect
28. Margin of Safety
29. McKinsey SCR Framework
30. Muda (Waste Identification)
31. Murphy's Law
32. Occam's Razor
33. Opportunity Cost
34. Optionality
35. Pareto Principle (80/20 Rule)
36. Parkinson's Law
37. Path Dependence
38. Poka-yoke
39. Power Law
40. Pre-Mortem Analysis
41. Probabilistic Thinking
42. Redundancy
43. Regret Minimization Framework
44. Reversible vs. Irreversible Decisions
45. RTRI (Role, Task, Rules, Input/Output)
46. Second-Order Thinking
47. Socratic Method
48. Systems Thinking
49. The 5 P's of Good Storytelling
50. The 5 Whys
51. The Cobra Effect
52. The Map is Not the Territory
53. The Pixar Framework: For Making Change Memorable
54. Theory of Constraints
55. Thought Experiments
56. Unintended Consequences
57. Via Negativa
58. Wardley Mapping
59. What? So What? Now What? (WSWNW)

### Product (78)
1. 4C Truth Framework
2. Activation Energy
3. Adverse Selection
4. Anchoring in Negotiation
5. Antifragility
6. Arbitrage
7. Asymmetric Warfare
8. BATNA
9. Behavioral Economics
10. Bundling/Unbundling
11. Cannibalization
12. Commoditization
13. Comparative Advantage
14. Competitive Exclusion
15. Consumer Surplus
16. Creative Destruction
17. Critical Mass
18. Crossing the Chasm
19. Diminishing Returns
20. Disruption
21. Disruptive Innovation
22. Economic Moat
23. Economies of Scale
24. Entropy
25. Equilibrium
26. Evolution
27. First-Mover Advantage
28. Flywheel Effect
29. Freemium
30. Game Theory
31. Giffen Goods
32. Half-Life
33. Incentives
34. Incremental Innovation
35. Inertia
36. Information Asymmetry
37. Jobs to Be Done
38. Late-Mover Advantage
39. Leverage
40. Lock-In
41. Long Tail
42. Marginal Analysis
43. Marginal Cost/Benefit
44. Market Segmentation
45. Metcalfe's Law
46. Momentum
47. Moral Hazard
48. Mutation
49. Nash Equilibrium
50. Natural Selection
51. Network Effects
52. Platform vs. Product
53. Porter's Five Forces
54. Positioning
55. Price Discrimination
56. Price Elasticity
57. Principal-Agent Problem
58. Prisoner's Dilemma
59. Problem-Agitate-Solve (PAS)
60. Product-Market Fit
61. Pyramid of Advantages
62. Razor and Blades
63. Red Queen Effect
64. Reservation Price
65. Signaling
66. Substitutes and Complements
67. Supply and Demand
68. Sustaining Innovation
69. Time Value of Money
70. Tit-for-Tat
71. Tragedy of the Commons
72. Two-Sided Markets
73. Value Creation vs. Capture
74. Veblen Goods
75. Winner-Take-All Markets
76. Zero-Sum vs. Positive-Sum
77. ZOPA
78. RICE Prioritization Framework

## Data
Deck payload files:
1. `public/decks/mental-models.json`
2. `public/models-latest.json`

To rebuild the dataset from source markdown:

```bash
npm run build:models
```

## Development
Install dependencies and run the app locally:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure
1. `src/App.tsx`: main app shell, index modal, and deck interactions.
2. `src/core/`: swipe/flip/deck state and core UI behavior.
3. `src/content/`: adapters, renderers, and model-specific presentation logic.
4. `scripts/build-models.mjs`: model build pipeline from source markdown to JSON payloads.
5. `docs/`: published static build for GitHub Pages.
