# Development Notes

## Considerations & Design Decisions

### Architecture & Code Organization

- **React Project Structure**: In the web React project, models were omitted and only Entities were used. This decision was made because the BFF is proprietary and view-focused, eliminating the need for a full DTO → Entity → Model separation in React, which would only make it unnecessarily verbose.

- **Raect's Use Case Layer**: Unit tests were not added to use cases because they act as a simple orchestration layer, primarily used to maintain clean code consistency rather than containing complex business logic.

### UI/UX Decisions

- **Style Guide Expansion**: The style guide in Zeplin does not contain all the colors and spacing options present in the mocks themselves. For that reason, the style guide was expanded to include the additional design tokens needed as well as other tokens that became necessary.

### Privacy

- **Public Env Files**: Since this project is intend for test only all the environment variables are integrated in the repo, both o /env and in each service's folder

## Future Improvements

### Features

- **Statistics**: Add other statistics metrics such as top searched strings, most popular characters/films by amount of clicks and etc...

### Testing

- **E2E and Unit testing**: Add remianing unit tests inside the services components to reach a solid coverage. Also, add E2E testing to ensure the entire flow is working and stable.

### Infrastructure & Performance

- **Redis Optimization**: Split Redis into two containers (as to not affect both the bff's and starwars service's caches in case of a downtime)

- **Rate Limiting**: Copy all data from the SWAPI daily to get around the 10,000 daily rate limit using a cronjob

- **Database Scaling**: Implement daily partitioning of the database for handling big volumes as time goes by

### Frontend Improvements

- **Theme Icons**: Fix the delay in icons when changing theme

- **Statistics Page**: Make the statistics page dynamic to accept other statistics types

- **Theme Persistence**: Move theme logic into a Provider and/or save theme in localStorage to maintain theme on reload

- **Statistics Empty State**: Delegate the empty state decision to the BFF by using a flag or different HTTP status code to signal an empty state, instead of relying on string equality checks in the frontend

### Backend & API Improvements

- **BFF Endpoints**: Separate the statistics endpoints in the BFF so the frontend can load them in parallel and(or) perform lazy-loading

- **Error Handling**: Improve error messages and endpoint status codes

### Scheduling & Configuration

- **Cron Job Flexibility**: Make the interval of the cron job more dynamic, allowing for different time ranges (not only minutes)
