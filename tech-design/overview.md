# Technical Design Overview

## 1. Introduction
This document outlines the technical architecture for the Video Generation Guidance Platform. The system is designed to assist users in creating high-quality video generation prompts starting from a Voice-Over (VO) script. It leverages Large Language Models (LLMs) for content analysis and generation, and integrates with Aliyun services for infrastructure.

## 2. System Architecture

### 2.1 Technology Stack
- **Frontend Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3) - Server-Side Rendering (SSR) for SEO and performance.
- **State Management**: [Pinia](https://pinia.vuejs.org/) - For managing complex client-side state (Global Assets, Storyboard).
- **Workflow Orchestration**: [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) - For managing the complex, multi-step generation workflows (VO -> Concept -> Storyboard).
- **UI Framework**: Tailwind CSS + Shadcn-vue (or similar) for a premium, modern design.
- **Database**: PostgreSQL (recommended) or MySQL - For user data, CDKeys, and project persistence.
- **Object Storage**: Aliyun OSS - For storing user uploads (reference images) and generated audio.
- **LLM Providers**:
    - **SiliconFlow**: For high-performance open-source models (e.g., Qwen, Llama).
    - **Aliyun Bailian**: For proprietary models and multimodal capabilities.

### 2.2 High-Level Architecture
```mermaid
graph TD
    User[User Browser]
    
    subgraph "Client (Nuxt 3)"
        UI[UI Components]
        Store[Pinia Store]
        LangGraphClient[LangGraph Client Runtime]
    end
    
    subgraph "Server (Nuxt Nitro / Backend)"
        API[API Routes]
        Auth[Auth Middleware]
        LangGraphServer[LangGraph Server Runtime]
        DB_Adapter[Database Adapter]
    end
    
    subgraph "Cloud Infrastructure (Aliyun)"
        OSS[Object Storage Service]
        DB[(Database)]
        Bailian[Bailian LLM Service]
    end
    
    subgraph "External Services"
        SiliconFlow[SiliconFlow API]
        TTS[TTS Service]
    end
    
    User <--> UI
    UI <--> Store
    UI <--> API
    API <--> Auth
    API <--> LangGraphServer
    LangGraphServer <--> DB_Adapter
    LangGraphServer <--> Bailian
    LangGraphServer <--> SiliconFlow
    LangGraphServer <--> TTS
    DB_Adapter <--> DB
    UI <--> OSS : Direct Upload (Presigned URL)
```

## 3. Core Modules Design

### 3.1 Authentication & CDKey System
- **User Model**: ID, Phone, PasswordHash, Status (Active/Inactive), CreatedAt.
- **CDKey Model**: KeyString, Status (Unused/Used/Expired), BoundUserId, ValidDuration, ActivatedAt.
- **Flow**:
    1.  Registration creates an `Inactive` user.
    2.  Login checks status. If `Inactive`, redirect to `/activate`.
    3.  Activation validates CDKey, updates User status to `Active`, and sets expiration.
    4.  Middleware `auth.global.ts` checks token validity and CDKey expiration for protected routes.

### 3.2 Global Assets Module
- **Data Structure**:
    -   `VO`: `Array<{ id, text, audioUrl, duration, startTime, endTime }>`
    -   `StoryConcept`: `{ genre, style, theme, keywords }`
    -   `Characters`: `Array<{ id, name, description, masterRefImage }>`
    -   `Scenes`: `Array<{ id, name, description, masterRefImage }>`
- **Logic**:
    -   **VO Split**: LLM call to split text.
    -   **TTS**: Async job to generate audio for each segment.
    -   **Concept/Asset Extraction**: Chained LLM calls analyzing the full VO.

### 3.3 Storyboard Engine
- **Data Structure**:
    -   `Panel`: `{ id, sceneId, visualDesc, compositionDesc, refImage, audioId, duration, cameraMove, t2iPrompt, i2vPrompt }`
- **Batch Generation**:
    -   Uses **LangGraph** to manage the state of a "Generation Session".
    -   **Context Window Management**: The prompt for Batch N includes a summary of Batch N-1 to ensure continuity.
    -   **Streaming**: Stream LLM responses to the UI for better UX.
- **Floating Preview**:
    -   A reactive component that subscribes to the `GlobalAssets` store.
    -   Updates automatically when the user selects a panel (showing relevant characters for that scene).

### 3.4 LLM Integration Layer
- **Unified Interface**: `generate(prompt, images[], options)`
- **Provider Strategy Pattern**: Switch between SiliconFlow and Bailian based on task type (e.g., simple text gen vs. complex visual analysis).
- **Prompt Engineering**:
    -   Templates stored in code or database.
    -   Dynamic injection of Global Assets into Storyboard generation prompts.

### 3.5 Generic LangGraph Interaction Pattern
This pattern abstracts the standard "Generate -> Review -> Refine" loop used across VO, Concept, and Storyboard modules.

1.  **Template Loading (Backend)**:
    -   System loads a specific `PromptTemplate` (e.g., "Story Concept Generator") from the codebase or database.
2.  **Provider Binding (Backend)**:
    -   A `CustomProvider` (based on generate function) fills the template with dynamic data (User Input + Context).
    -   Converts the filled template into an executable `Runnable` (function).
3.  **Execution (Backend)**:
    -   `Runnable.invoke()` is called.
    -   Returns a raw string or structured JSON response.
4.  **Parsing & UI Rendering (Full Stack)**:
    -   **Parser**: Transforms the raw LLM output into a structured UI State object.
    -   **UI Template**: A specific Vue component (e.g., `ConceptCard.vue`) renders this state.
5.  **User Loop (Frontend)**:
    -   **Modify**: User edits the content directly in the UI.
    -   **Regenerate**: User clicks "Regenerate". The modified state is sent back as feedback/context for the next `invoke`.
    -   **Commit**: User accepts the result (Copy or Save), persisting it to the Global Assets store.

## 4. Key Technical Challenges & Solutions

### 4.1 Context Management in Long Stories
- **Challenge**: Generating consistent storyboards for long scripts exceeds LLM context limits.
- **Solution**:
    -   **Hierarchical Summary**: Maintain a "Story Bible" (Global Assets) that is always passed.
    -   **Sliding Window**: Pass the last 3-5 panels as immediate context.
    -   **Batching**: Generate 30 panels at a time, summarizing the previous batch before starting the next.

### 4.2 Multimodal Input Handling
- **Challenge**: Passing user-uploaded reference images to the LLM for consistency checking.
- **Solution**:
    -   Use Aliyun Bailian's multimodal capabilities (or GPT-4V equivalent via SiliconFlow if available).
    -   Convert images to Base64 or pass public OSS URLs depending on API requirements.

### 4.3 Complex Workflow State (LangGraph)
- **Challenge**: Managing the dependency chain (VO -> Concept -> Storyboard) and allowing users to go back and edit.
- **Solution**:
    -   Use **LangGraph.js** to define the workflow as a graph.
    -   Each node (e.g., "Generate Concept") is a distinct step.
    -   Persist the graph state (Checkpoints) to the database so users can resume sessions.

### 4.4 Asset Consistency
- **Challenge**: Ensuring generated prompts produce consistent characters.
- **Solution**:
    -   **Master References**: Enforce the use of "Master Reference Images" in the prompt generation phase (using Image Prompts or IP-Adapter syntax if the downstream tool supports it, otherwise detailed textual description).
    -   **Prompt Templates**: Standardize the structure of T2I prompts (e.g., `[Character Desc] + [Action] + [Environment] + [Style]`).

## 5. Implementation Roadmap
1.  **Phase 1: Foundation**: Project setup, Auth system, CDKey verification, OSS integration, llm integration.
2.  **Phase 2: Interaction Foundation**: Generic LangGraph Interaction Pattern.
3.  **Phase 3: Global Assets**: VO editor, Split logic, TTS integration, Concept/Asset extraction.
4.  **Phase 4: Storyboard Core**: Batch generation logic(P1), Panel editor.
5.  **Phase 5: Prompt Engineering**: Fine-tuning prompts for T2I/I2V, Export functionality.
6.  **Phase 6: UI Polish**: Animations, transitions, responsive design.
