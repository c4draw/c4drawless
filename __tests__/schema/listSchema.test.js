'use strict';

const mod = require('../../functions/schema/list');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' });
const sinon  = require('sinon');
const AWS = require('aws-sdk');
const uuid = require('uuid');

describe('list', () => {
  const databseStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);
  const args = {
    pathParameters: { userId: uuid.v4() },
    databaseConnection: databseStub,
  };

  describe('when making a request', () => {
    let response;

    describe('and the database returns data', () => {
      const returnedData = [1,2,3]

      beforeEach(async () => {
        databseStub.scan.yieldsRight(false, { Items: returnedData });
        response = await wrapped.run(args);
      })

      it('should return a 200 http status', () => {
        expect(response.statusCode).toBe(200);
      });

      it('should return the content type as application json', () => {
        expect(response.headers['Content-Type']).toBe('application/json');
      });

      it('should return parsed data from the database', () => {
        expect(response.body).toBe(JSON.stringify(returnedData));
      });

      it('should return that anywhere can receive the response', () => {
        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      });
    });

    describe('and there is a problem on the database', () => {
      beforeEach(async () => {
        databseStub.scan.yieldsRight(true, {});
        response = await wrapped.run(args);
      })

      it('should return a 500 http status', () => {
        expect(response.statusCode).toBe(500);
      });

      it('should return the content type as plain text', () => {
        expect(response.headers['Content-Type']).toBe('text/plain');
      });

      it('should return a friendly error message', () => {
        expect(response.body).toBe(
          "Couldn't find the schema item"
        );
      });
    });
  });
});
