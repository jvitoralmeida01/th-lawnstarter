- In the web React project, I did not include models and only used Entities because of the BFF being proprietary and view focused, eliminating the need for a full DTO -> Entity -> Model separation in React, which would only make it unnecessarily verbose

- The stylguide in Zeplin does not contain all the colors and spacing options as the mocks themselves. For that reason, I expanded the styleguide

- Move the theme logic into a Provider for better readability and(or) save the theme in the localStorage to maintain theme on reload

- Didint add unit tests to useCases because they are acting as a simple layer (only used to maintain clean code consistency)
