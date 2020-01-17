#use mariadb
FROM mariadb:latest

#use a volume to store everythink form the database.
VOLUME /sirladb

#set password and main database
ENV MYSQL_ROOT_PASSWORD=mypass
ENV MYSQL_DATABASE=SIRLA


