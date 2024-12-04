stateDiagram-v2
[*] --> UserInputPage : User Starts App

    state UserInputPage {
        direction TB
        EnvironmentSetting --> CharacterCreation
        CharacterCreation --> PlotDefinition
        PlotDefinition --> StoryParameters
    }

    UserInputPage --> AIStoryGeneration : Submit Story Parameters

    state AIStoryGeneration {
        direction TB
        TextGeneration --> PageStructuring
        PageStructuring --> NarrativeValidation
    }

    AIStoryGeneration --> AIIllustrationGeneration : Story Approved

    state AIIllustrationGeneration {
        direction TB
        CoverIllustration --> PageByPageIllustration
        PageByPageIllustration --> StyleConsistencyCheck
    }

    AIIllustrationGeneration --> StoryAssembly : Illustrations Complete

    state StoryAssembly {
        direction TB
        TextLayoutDesign --> IllustrationPlacement
        IllustrationPlacement --> FinalBookFormatting
    }

    StoryAssembly --> UserPreview : Book Assembled

    state UserPreview {
        direction TB
        PageFlip --> EditOption
        EditOption --> [*] : Save/Export Book
    }

    note right of UserInputPage
      Collect:
      - Environment
      - Characters
      - Plot Details
      - Age Range
      - Story Tone
    end note

    note right of AIStoryGeneration
      Generate:
      - 10-page narrative
      - Age-appropriate language
      - Coherent storyline
    end note

    note right of AIIllustrationGeneration
      Create:
      - Cover illustration
      - Page-specific images
      - Consistent art style
    end note
