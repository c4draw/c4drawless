'use strict';

const mod = require('../functions/about');
const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' });

describe("index", () => {
  it("should successfully return the api version", () => {
    return wrapped.run({}).then((response) => {
      console.log(response)
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("1.0.0");
    });
  });
});
