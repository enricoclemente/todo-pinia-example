# User Interface description

The user interface has been restructured in the following way while still leaving the original style to remain the same:

- **Title**: a title was first included to send the user a hint about the focus of the page he or she is on.

- **TODO creation**: the creation of a new TODO has been moved to a modal so as to first give the focus on the TODO list. The user can then create a todo by clicking on the provided button. The creation modal makes explicit the need for the two required fields

- **TODO list**: the todo list remained overall the same in structure. For each TODO, date information has been added and the edit button has been added so the user can easily manage each item

- **TODO editing**: the editing part relies on a modal identical in structure to the creation modal so as not to confuse the user with too many different features. The labels make it clear that you are editing a TODO rather than creating it

- **Feedbacks**: several feedbacks have been added so as to provide the user with awareness of the outcome of the main operations. If in the creation and editing modals the fields are not filled an error message appears below the relevant fields. Following creation, editing, and deletion operations a confimartion pop-up is returned indicating to the user that the operation was successful, and in case of problems (e.g., errors with the server) an error pop-up will be shown
