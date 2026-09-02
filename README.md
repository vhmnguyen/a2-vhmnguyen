# D&D Party Tracker

D&D Party Tracker is a web app for managing a Dungeons & Dragons adventuring party. Users can add, view, edit, delete, and modify characters. Character status is automatically calculated by the server based on current and maximum HP.

The application uses CSS Grid to organize the character entry form and an external CSS stylesheet.

## How to Use

1. Enter a character's name, class, species, level, current HP, and maximum HP.
2. Click **Add Character** to add the character to the party.
3. View all characters and their current information in the party table.
4. Use **Edit** to modify an existing character.
5. Use **Delete** to remove a character.
6. Use **Add HP** or **Subtract HP** to modify a character's current HP.

Character status is automatically calculated based on HP:
- **Alive**: current HP is at least half of maximum HP
- **Bloodied**: current HP is below half of maximum HP
- **Dead**: current HP is 0

## Technical Achievements

- **(5 points) Create a single-page app that both provides a form for users to submit data and always shows the current state of the server-side data:** The web app provides both the character entry form and the current party data on a single page. When users add, edit, delete, or modify a character, the client sends a request to the server, the client then sees the updated table.

- **(5 points) In addition to a form enabling adding and deleting data on the server, also add the ability to modify existing data:** The app allows users to modify existing character information using the **Edit** button.

### Design/Evaluation Achievements

- **(5 points per participant) User Eval:**