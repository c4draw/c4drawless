'use strict';

const mod = require('../../functions/schema/create');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' });
const sinon  = require('sinon');
const AWS = require('aws-sdk');
const uuid = require('uuid');

describe('create', () => {
  describe('when making a request', () => {
    let response;
    describe('and the request body is valid', () => {
      const databseStub = sinon.createStubInstance(AWS.DynamoDB.DocumentClient);
      const args = {
        databaseConnection: databseStub,
        pathParameters: { userId: uuid.v4() },
        body: JSON.stringify({ elements: [{}] })
      };

      describe('and the item is saved on the database', () => {
        let parsedResponse
        const clock = sinon.useFakeTimers();

        afterEach(() => {
          clock.restore();
        })

        beforeEach(async () => {
          databseStub.put.yields(false);
          response = await wrapped.run(args);
          parsedResponse = JSON.parse(response.body)
        })

        it('should return a 201 http status', () => {
          expect(response.statusCode).toBe(201);
        });

        it('should return the content type as application json', () => {
          expect(response.headers['Content-Type']).toBe('application/json');
        });

        it('should return that anywhere can receive the response', () => {
          expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
        });

        it('should return the saved item', () => {
          const currentDate = new Date().getTime()

          expect(parsedResponse.schemaId).not.toBeNull();
          expect(parsedResponse.userId).not.toBeNull();
          expect(parsedResponse.checked).not.toBeNull();
          expect(parsedResponse.createdAt).toBe(currentDate);
          expect(parsedResponse.updatedAt).toBe(currentDate);
        });
      });

      describe('and there is a problem on the database', () => {
        beforeEach(async () => {
          databseStub.put.yields(true);
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
            "Couldn't create the schema item"
          );
        });
      });
    });
  });
});
