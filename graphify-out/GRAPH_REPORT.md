# Graph Report - .  (2026-08-01)

## Corpus Check
- Corpus is ~23,439 words - fits in a single context window. You may not need a graph.

## Summary
- 96 nodes · 98 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Package Scripts
- Vercel Env Sync
- Frontend App UI
- Learning Product Story
- React Vite Dependencies
- Static Build Tests
- Waitlist API Tests
- Exam Prep Context
- Error Boundary
- Waitlist API

## God Nodes (most connected - your core abstractions)
1. `scripts` - 8 edges
2. `LandingPageErrorBoundary` - 5 edges
3. `SabiPass AI` - 5 edges
4. `App()` - 4 edges
5. `run()` - 4 edges
6. `invoke()` - 3 edges
7. `Socratic Mobile Tutor` - 3 edges
8. `Nigerian Exam Preparation` - 3 edges
9. `escapeHtml()` - 2 edges
10. `buildConfirmationEmail()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Teacher Guided Questioning` --semantically_similar_to--> `Socratic Mobile Tutor`  [INFERRED] [semantically similar]
  public/images/teacher-classroom-hands-raised.jpg → index.html
- `Family Supported Study` --conceptually_related_to--> `SabiPass AI`  [INFERRED]
  public/images/family-study-home.jpg → index.html
- `Peer Classroom Study` --conceptually_related_to--> `Nigerian Exam Preparation`  [INFERRED]
  public/images/african-students-classroom.jpg → index.html
- `Interactive Classroom` --conceptually_related_to--> `Reasoning Not Answer Copying`  [INFERRED]
  public/images/teacher-classroom-hands-raised.jpg → index.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SabiPass Learning Positioning** — index_sabipass_ai, index_socratic_mobile_tutor, index_nigerian_exam_prep, index_reasoning_not_answer_copying, index_mastery_building [EXTRACTED 1.00]
- **Student Learning Context Visuals** — public_images_african_students_classroom_peer_classroom_study, public_images_family_study_home_home_learning_environment, public_images_teacher_classroom_hands_raised_interactive_classroom [INFERRED 0.75]

## Communities (10 total, 2 thin omitted)

### Community 0 - "Package Scripts"
Cohesion: 0.15
Nodes (12): devDependencies, name, private, scripts, build, dev, preview, test (+4 more)

### Community 1 - "Vercel Env Sync"
Cohesion: 0.15
Nodes (10): env, environments, envPath, { execFileSync, spawnSync }, fs, missing, optionalKeys, path (+2 more)

### Community 2 - "Frontend App UI"
Cohesion: 0.19
Nodes (10): App(), examFlows, getReadinessDays(), imageAssets, readinessDate, roles, topicFlows, useScrollMotion() (+2 more)

### Community 3 - "Learning Product Story"
Cohesion: 0.20
Nodes (11): Mastery Building, Reasoning Not Answer Copying, SabiPass AI, Socratic Mobile Tutor, Waitlist Conversion, Family Study Home, Family Supported Study, Home Learning Environment (+3 more)

### Community 4 - "React Vite Dependencies"
Cohesion: 0.18
Nodes (11): lucide-react, dependencies, lucide-react, react, react-dom, vite, @vitejs/plugin-react, react (+3 more)

### Community 5 - "Static Build Tests"
Cohesion: 0.18
Nodes (9): api, app, assert, css, fs, html, packageJson, path (+1 more)

### Community 6 - "Waitlist API Tests"
Cohesion: 0.25
Nodes (10): assert, createFetchMock(), createResponse(), handlerPath, invoke(), loadHandler(), originalEnv, path (+2 more)

### Community 7 - "Exam Prep Context"
Cohesion: 0.40
Nodes (5): Nigerian Exam Preparation, WAEC, NECO, and JAMB, African Students Classroom, Peer Classroom Study, School Uniform Students

## Knowledge Gaps
- **51 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `React Vite Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `SabiPass AI` connect `Learning Product Story` to `Exam Prep Context`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._