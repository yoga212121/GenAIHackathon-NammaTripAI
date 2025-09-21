# **App Name**: WanderWise AI

## Core Features:

- Personality-Based Trip Quiz: AI-powered quiz to determine user's travel preferences based on visual/attraction/situation-based questions, mapping personality to broad destination types.
- Destination Suggestion Engine: Suggest destinations based on user budget, trip duration, and interests (provided directly or inferred from quiz).
- Weather Information Retrieval: Fetch and display current weather conditions for suggested destinations using a weather API.
- Dynamic Itinerary Planning: Generate a personalized itinerary tool, factoring in user selected places along with budget and timeline preferences. Itinerary should provide images for destinations with a pricing summary.
- Itinerary Selection and Price Updates: As user selects an itinerary item from Google Maps API/Places, dynamically update total price and time estimates. The LLM uses the user's itinerary selection as a tool to generate a final updated version of the itinerary.
- Budget-Aware Planning: Alert user if itinerary exceeds their budget. Provides alternative, cheaper options via AI tool.
- Destination Image Carousel: Visually appealing carousel of images for suggested destinations with price details. Integrates Google Maps API to pull in user selected items, with associated price updates to total and remaining.

## Style Guidelines:

- The app is designed to evoke a sense of adventure and trustworthiness. The color palette is built around a vibrant blue primary color (#3498DB), suggestive of open skies and clear waters. The background color is a desaturated light blue (#E7F3F8), and an analogous purple hue will be used for accents (#9B59B6).
- Font pairing: 'Poppins' (sans-serif) for headlines and 'PT Sans' (sans-serif) for body text, creating a modern and readable feel.
- Use clean, line-based icons to represent different travel activities and interests.
- Prioritize a clean and intuitive layout. Use card-based design for destinations and itinerary items.  Ensure mobile responsiveness.
- Subtle transitions and animations on itinerary updates.