# Cloud App Devolpment CA

Using REST API, these are the types of endpoints that are queried via the Web API.

GET /movies/movieid - return a specific movie item.
GET /movies/movieid/actors - return all actors in a movie.
GET /movies/movieid/actors/actorid - get a movie cast member
GET /awards?movie=movieid&actor=actorid&awardBody=name - querystring
movie - movie details 
movie and actor - the cast member for the movie
movie, actor, and award body - the award won by the cast member for that award body.
movie and award body - the award(s) won by the movie for the award body.
actor and award body - the award(s) won by the actor for the award body.
POST /movies - add a new movie item.
DELETE /movies/movieid - delete a specific movie item

# Data Types used by this App

## Movie:
movie ID - number.
title - string.
release date - string.
overview - string.
## Actor:
actor id - number.
name - string.
bio - string.
date of birth - string.
## Cast (Movie cast):
movie id
actor id
role name - string.
role description - string.
## Award 
award id - number 
body - string
category - string
year - number
