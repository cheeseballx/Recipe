# Recipe
Recipes as example, docker, swagger, oas3, mariadb, frotnend-backend

## important infos
just docker-compose up just runs if and only if the mariadb image is already there. So on new System 
its needed to run sudo docker run mariadb. It cancels with errors but doesnt matter, so we have the image locally


## Go into docker db
mysql -u root -p -P 3306 -h 0.0.0.0

## positions 
We use a method for positioning with string, where we use split on a special character, 21#startword#endword


