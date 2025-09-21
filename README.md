# NammaTripAI

This is a Next.js web application, bootstrapped with Firebase Studio, that acts as an intelligent, AI-powered trip planner. It helps users discover new destinations and create detailed, personalized travel itineraries.

## Features

- **AI-Powered Itinerary Generation**: Leverages Google's Gemini models via Genkit to create dynamic and personalized travel plans.
- **Dual Planning Modes**:
  - **Destination Quiz**: A fun, image-based quiz that asks users about their travel preferences (e.g., scenery, pace, activities) and suggests a suitable destination.
  - **Manual Trip Planner**: A form where users can enter a specific destination, budget, duration, and interests to get a custom-built itinerary.
- **Intelligent Interest Handling**: Users can provide general interests (e.g., "hiking, food") or specific, famous place names (e.g., "Cubbon Park, Vidyarthi Bhavan"), and the AI will build a plan around them.
- **Real-World Place Integration**: Uses the Google Places API to fetch details about attractions and restaurants, ensuring all suggestions are real and relevant.
- **Authentic & Famous Suggestions**: The AI is prompted to search for "famous," "iconic," and "authentic" local gems, ensuring high-quality recommendations.
- **Budget-Aware Planning**: If a generated itinerary exceeds the user's specified budget, the app offers a one-click option to have the AI find cheaper alternatives.
- **Interactive UI**: The application features a modern, responsive interface with carousels for place suggestions and interactive forms.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit) (Google's Generative AI toolkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **Icons**: [Lucide React](https://lucide.dev/)
