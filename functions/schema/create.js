'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');


module.exports.handle = (event, _context, callback) => {
  const dynamoDbConnection = event.databaseConnection || new AWS.DynamoDB.DocumentClient();

  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  const userId = event.pathParameters.userId;

  const params = {
    TableName: process.env.SCHEMA_TABLE,
    Item: {
      schemaId: uuid.v4(),
      userId: userId,
      elements: data.elements,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };


  dynamoDbConnection.put(params, (error) => {
    if (error) {
      callback(null, {
        statusCode: 500,
        headers: { 'Content-Type': 'text/plain' },
        body: "Couldn't create the schema item",
      });
      return;
    }

    const response = {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
