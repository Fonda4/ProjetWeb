a faire : 



&#x09;games : 

&#x09;	# Referee can change game status if transition rules are respected

&#x09;	# Start the game

&#x09;	# Update the score

&#x09;	# Started games shouldn't be able to change teams

&#x09;	# Finish the game

&#x09;	# We should no longer be able to update the score if finished

&#x09;	# We should no longer be able to update the score if started

&#x09;teams : message # The users email must contain at least one character . and one @

&#x09;	message # Each user fills their email, username, password, etc...

&#x09;	message # No duplicate usernames or emails

&#x09;	message # Non-authenticated visitor cannot list users

&#x09;	message # Non-authenticated cannot view anything

&#x09;	message # Non-authenticated cannot edit anything

&#x09;	message # ids must match

&#x09;

&#x09;	# user must exist ????????????????



&#x09;	# User cannot edit someone else

&#x09;	# User can edit their info, but not their status or role!

&#x09;	# role should remain player and status active

&#x09;	# Admin can edit info

&#x09;	message # Non-admin cannot delete user

&#x09;	message # Non-authenticated cannot delete user

&#x09;	message # Admin can soft-delete user

&#x09;	message # Admin cannot be soft-deleted

&#x09;	# Others can't search by username

&#x09;	message # Others can't search by username

&#x09;	# Admin cannot change role of non-player

&#x09;	message # User cannot change user role

&#x09;	message # Admin can reactivate user

&#x09;	message # User cannot reactivate user

&#x09;	message	# Admin cannot reactivate non-existing user







&#x09;











&#x09;

