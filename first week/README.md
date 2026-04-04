# ProjetWeb
Repo du projet Web de Vinci 1ere
Groupe 12
| Nom de la route | Controller | Méthode HTTP | Chemin | Paramètre de chemin | Paramètres de query | Qui a accès | Corps de la requête | Données renvoyées en cas de succès | Codes d'erreurs potentiels | Description |
|---|---|---|---|---|---|---|---|---|---|---|
| POST /auth/login | /auth/login | POST | /auth/login | / | / | Tout le monde | `{username, password}` | AuthDTO | 401 (Invalid creds) | Authentifie un utilisateur |
| POST /users | /users | POST | /users | / | / | Admin et visiteur | `{email, username, ...}` | UserDTO | 400 (Bad input), 409 (Conflict) | Crée un nouveau compte (joueur par défaut) |
| GET /users | /users | GET | /users | / | / | Admin et user | / | UserShortDTO[] | / | Liste les infos basiques de tous les utilisateurs |
| GET /users/search | /users/search | GET | /users/search | / | `username` ou `email` | Admin et arbitre | / | UserDTO[] | 404 (Not found) | Recherche un joueur spécifique |
| GET /users/:id | /users/:id | GET | /users/:id | `id` | / | Users | / | UserDTO | 404 (Not found) | Récupère les détails d'un utilisateur par son ID |
| PATCH /users/me | /users/me | PATCH | /users/me | / | / | Son équipe, lui-même et admin | `{firstName, lastName, ...}` | UserDTO | 400 (Bad input) | Met à jour ses propres informations |
| PATCH /users/:id/role | /users/:id/role | PATCH | /users/:id/role | `id` | / | Admin | `{role}` | UserDTO | 403 (Forbidden) | Modifie le rôle d'un joueur |
| DELETE /users/me | /users/me | DELETE | /users/me | / | / | Son équipe, lui-même et admin | / | `{message}` | 403 (Admin status) | Désactive son propre compte (status → inactive) |
| DELETE /users/:id | /users/:id | DELETE | /users/:id | `id` | / | Admin | / | `{message}` | 403 (Forbidden) | Désactive le compte d'un tiers |
| GET /games | /games | GET | /games | / | / | Tout le monde | / | GameDTO[] | / | Liste des matchs et scores |
| POST /games | /games | POST | /games | / | / | Admin et arbitre | `{date, field, teams, ...}` | GameDTO | 400, 422 (Already started) | Crée un match (statut : "created") |
| PUT /games/:id | /games/:id | PUT | /games/:id | `id` | / | Admin et arbitre | `{date, field, teams, ...}` | GameDTO | 400 (Invalid transition) | Planifie un match (devient "scheduled") |
| PATCH /games/:id/status | /games/:id/status | PATCH | /games/:id/status | `id` | / | Admin, trainer et arbitre | `{status}` | GameDTO | 403 (Not started) | Change l'état du match (ex : started) |
| PATCH /games/:id/score | /games/:id/score | PATCH | /games/:id/score | `id` | / | Admin et arbitre | `{home, away}` | `{message}` | 404 (Not found) | Met à jour le score d'un match commencé |
| DELETE /games/:id | /games/:id | DELETE | /games/:id | `id` | / | Admin | / | `{message}` | 404 (Not found) | Supprime définitivement un match |