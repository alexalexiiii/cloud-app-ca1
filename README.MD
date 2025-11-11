# Movies API - Cloud App CA

This project is a serverless movies API built with AWS CDK, Lambda, API Gateway, DynamoDB, and Cognito.
It demonstrates how to build and deploy a RESTful backend using AWS cloud services.

# Stack

AWS CDK (TypeScript)

AWS Lambda (Node.js 18)

Amazon API Gateway

Amazon DynamoDB

Amazon Cognito

## API Base URL
https://685sx3bu93.execute-api.eu-west-1.amazonaws.com/prod

## Endpoints
Method	Endpoint	Description
GET	/movies	List all movies
GET	/movies/{movieid}	Get a movie by ID
POST	/movies	Add a new movie
DELETE	/movies/{movieid}	Delete a movie
GET	/movies/{movieid}/actors	Get actors in a movie
GET	/awards	List awards
GET	/public	Public test endpoint
GET	/protected	Protected endpoint (requires Cognito)

## Example POST Body
{
  "movieId": "4321",
  "title": "The Dark Knight",
  "releaseDate": "2008-07-18",
  "overview": "When the menace known as the Joker wreaks havoc on Gotham City, Batman must face one of his greatest tests."
}

## Example Response
{
  "message": "Movie added",
  "data": {
    "PK": "m4321",
    "SK": "xxxx",
    "title": "The Dark Knight",
    "releaseDate": "2008-07-18",
    "overview": "When the menace known as the Joker wreaks havoc on Gotham City..."
  }
}
