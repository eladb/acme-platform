/* global fetch */
const lambda = require('@aws-sdk/client-lambda');
const sqs = require('@aws-sdk/client-sqs');
const { FUNCTION_ARN, QUEUE_URL, API_URL } = process.env;
const assert = require("assert");

const lambdaClient = new lambda.LambdaClient();
const sqsClient = new sqs.SQSClient();


exports.handler = async (event) => {
  console.log('FUNCTION_ARN', FUNCTION_ARN);
  console.log('QUEUE_URL', QUEUE_URL);
  console.log('API_URL', API_URL);
  console.log('event', event);
  
  const payload = JSON.stringify({ hello: "Hello from test"});

  // invoke the lambda directly
  const result = await lambdaClient.send(new lambda.InvokeCommand({
    FunctionName: FUNCTION_ARN,
    Payload: payload,
  }));

  const response = JSON.parse(result.Payload.transformToString("utf8"));
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "Hello, CDK!");
  
  // invoke the lambda through the API gateway
  const apiResponse = await (await fetch(API_URL)).text();
  console.log(apiResponse);
  
  // send 10 messages to the queue
  for (let i = 0; i < 10; ++i) {
    await sqsClient.send(new sqs.SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: payload,
    }));
  }

  let retries = 10;
  
  while (retries-- > 0) {
    const attrs = await sqsClient.send(new sqs.GetQueueAttributesCommand({
      QueueUrl: QUEUE_URL,
      AttributeNames: ['ApproximateNumberOfMessages'],
    }));

    console.log(attrs);

    if (attrs.Attributes?.ApproximateNumberOfMessages === '0') {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  if (retries === 0) {
    throw new Error("timed out waiting for the function to consume the message from the queue");
  }

  console.log("queue was emptied successfully!");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from test-handler' }),
  };
};