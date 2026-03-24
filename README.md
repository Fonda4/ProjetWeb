# ProjetWeb
Repo du projet Web de Vinci 1ere
Groupe 12
|Nom de la route|Controller|Méthode HTTP|Chemin|Paramètre de chemin|Paramètres de query|Qui a accès|Corps de la requête|Données renvoyées en cas de succès|Codes d'erreurs potentiels|Description|
|-------------------|---------------------|----------------------|------------------------|--------------|---------------|---------------------|-----------------------|--------------------|-----------------|-------------------|
|POST/auth/login	|/auth/login	|POST	/|	/|	/|	users|	{username, password}	|AuthDTO  |	401 (Invalid creds)	|Authentifie un utilisateur|
POST/users	/users	POST	/	/	/	admin et visiteur	{email, username, ...}	UserDTO	400 (Input), 409 (Conflict)	Crée un nouveau compte (joueur par défaut).
GET/users	/users	GET	/	/	/	admin et user	/	UserShortDTO[]	/	Liste les infos basiques de tous les utilisateurs.
GET/users/search	/users/search	GET	Query: username ou email	/	username ou email	admin et arbitre	/	UserDTO[]	404 (Not found)	Recherche un joueur spécifique.
GET/users/:id	/users/:id	GET	Path: id	id	/	users	/	UserDTO	404 (Not found)	Récupère les détails d'un utilisateur par son ID.
PATCH/users/me	/users/me	PATCH	/	/	/	son équipe et lui-meme et admin	{firstName, lastName, ...}	UserDTO	400 (Bad input)	Met à jour ses propres informations.
PATCH/users/:id/role	/users/:id/role	PATCH	Path: id	id	/	admin	{role}	UserDTO	403 (Forbidden)	Modifie le rôle d'un joueur.
DELETE/users/me	/users/me	DELETE	/	id	/	son équipe et lui-meme et admin	/	{message}	403 (Admin status)	Désactive son propre compte (status -> inactive).
DELETE/users/:id	/users/:id	DELETE	Path: id	/	/	admin	/	GameShortDTO[]	/	Désactive le compte d'un tiers.
										
GET/games	/games	GET	/	/	/	tout le monde	/	GameDTO	/	Liste des matchs et scores.
POST/games	/games	POST	/	id	/	admin et arbitre	/	GameDTO	400, 422 (Started)	Crée un match (statut: "created").
PUT/games/:id	/games/:id	PUT	Path: id	id	/	admin et arbitre	{date, field, teams, ...}	GameDTO	400 (Invalid trans.)	Planifie un match (devient "scheduled").
PATCH/games/:id/status	/games/:id/status	PATCH	Path: id	id	/	admin, trainer et arbitre	{status}	GameDTO	403 (Not started)	Change l'état du match (ex: started).
PATCH/games/:id/score	/games/:id/score	PATCH	Path: id	id	/	admin et arbitre	{home, away}	{message}	404 (Not found)	Met à jour le score d'un match commencé.
DELETE/games/:id	/games/:id	PATCH	Path: id	/	/	admin	/	TeamDTO[]	/	Supprime définitivement un match.
<img width="3659" height="531" alt="image" src="https://github.com/user-attachments/assets/0bdd17c9-c1c8-4f7b-be03-a5be3d77982c" />

