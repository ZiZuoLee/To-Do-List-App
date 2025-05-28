# To-Do List App API Documentation

## Authentication
- **POST** `/api/auth/register` — Register a new user
- **POST** `/api/auth/login` — Login and receive JWT
- **GET** `/api/auth/me` — Get current user profile (auth required)

---

## Todos
- **GET** `/api/todos` — List all todos for authenticated user
- **POST** `/api/todos` — Create a new todo  
  **Body:** `{ title, subtitle, priority, due_date, is_archived, recurrence_rule, team_id, tag_ids }`
- **PUT** `/api/todos/:id` — Update a todo  
  **Body:** `{ title, subtitle, priority, due_date, is_archived, recurrence_rule, tag_ids }`
- **DELETE** `/api/todos/:id` — Delete a todo
- **GET** `/api/todos/tag/:tag_id` — Get todos by tag
- **GET** `/api/todos/team/:team_id` — Get todos by team
- **GET** `/api/todos/shared` — Get todos shared with the user

---

## Teams
- **GET** `/api/teams` — List all teams
- **POST** `/api/teams` — Create a new team  
  **Body:** `{ name }`
- **GET** `/api/teams/:id` — Get team by ID
- **PUT** `/api/teams/:id` — Update team  
  **Body:** `{ name }`
- **DELETE** `/api/teams/:id` — Delete team

---

## Tags
- **GET** `/api/tags` — List all tags for user
- **POST** `/api/tags` — Create a new tag  
  **Body:** `{ name }`
- **GET** `/api/tags/:id` — Get tag by ID
- **PUT** `/api/tags/:id` — Update tag  
  **Body:** `{ name }`
- **DELETE** `/api/tags/:id` — Delete tag

---

## Comments
- **POST** `/api/comments` — Add a comment to a todo  
  **Body:** `{ todo_id, content, parent_comment_id? }`
- **GET** `/api/comments/todo/:todo_id` — Get all comments for a todo
- **GET** `/api/comments/:id` — Get comment by ID
- **PUT** `/api/comments/:id` — Update comment  
  **Body:** `{ content }`
- **DELETE** `/api/comments/:id` — Delete comment

---

## Checklist Items
- **POST** `/api/checklists` — Add checklist item  
  **Body:** `{ todo_id, description, position? }`
- **GET** `/api/checklists/todo/:todo_id` — Get all checklist items for a todo
- **PUT** `/api/checklists/:id` — Update checklist item  
  **Body:** `{ description, is_completed, position }`
- **DELETE** `/api/checklists/:id` — Delete checklist item

---

## Attachments
- **POST** `/api/attachments` — Add attachment (mock)  
  **Body:** `{ todo_id, file_path, file_type?, file_size? }`
- **GET** `/api/attachments/todo/:todo_id` — Get all attachments for a todo
- **DELETE** `/api/attachments/:id` — Delete attachment

---

## Reminders
- **POST** `/api/reminders` — Add reminder  
  **Body:** `{ todo_id, remind_at, method? }`
- **GET** `/api/reminders/todo/:todo_id` — Get all reminders for a todo
- **PUT** `/api/reminders/:id` — Update reminder  
  **Body:** `{ remind_at, method, is_sent }`
- **DELETE** `/api/reminders/:id` — Delete reminder

---

## Activity Feed
- **GET** `/api/activity/user` — Get all activities for the user
- **GET** `/api/activity/team/:team_id` — Get all activities for a team

---

## Task Sharing
- **POST** `/api/sharing` — Share a todo with a user  
  **Body:** `{ todo_id, user_id, permission_level }`
- **GET** `/api/sharing` — Get all todos shared with the user
- **PUT** `/api/sharing` — Update sharing permission  
  **Body:** `{ todo_id, user_id, permission_level }`
- **DELETE** `/api/sharing` — Remove sharing  
  **Body:** `{ todo_id, user_id }`

---

## Custom Fields
- **POST** `/api/custom-fields` — Create a custom field  
  **Body:** `{ name, field_type }`
- **GET** `/api/custom-fields` — List all custom fields for user
- **PUT** `/api/custom-fields/:id` — Update custom field  
  **Body:** `{ name, field_type }`
- **DELETE** `/api/custom-fields/:id` — Delete custom field
- **POST** `/api/custom-fields/value` — Set value for a todo's custom field  
  **Body:** `{ todo_id, custom_field_id, value }`
- **GET** `/api/custom-fields/values/:todo_id` — Get all custom field values for a todo

---

## Audit Log
- **GET** `/api/audit` — Get all audit logs for the user
- **POST** `/api/audit` — Add a new audit log entry  
  **Body:** `{ entity_type, entity_id, action, old_value, new_value }`

---

## User Settings
- **GET** `/api/settings` — Get all settings for user
- **POST** `/api/settings` — Set or update a setting  
  **Body:** `{ setting_key, setting_value }`
- **DELETE** `/api/settings/:key` — Delete a setting

---

## Admin (Requires Admin Privileges)
- **GET** `/api/admin/users` — List all users with their roles
- **POST** `/api/admin/users/:id/roles` — Assign a role to a user  
  **Body:** `{ role_id }`
- **DELETE** `/api/admin/users/:id/roles/:role_id` — Remove a role from a user
- **GET** `/api/admin/teams` — List all teams

---

**All endpoints (except register/login) require the `Authorization: Bearer <token>` header.** 