import { App, Duration, Stack, aws_apigateway, aws_events, aws_lambda } from 'aws-cdk-lib';
import { ServerlessWorkload } from '../lib/index';

const app = new App();
const stack = new Stack(app, 'MyStack');

const worker = new ServerlessWorkload(stack, "MyWorker", {
  code: aws_lambda.Code.fromAsset("./handler"),
  runtime: aws_lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",
  schedule: aws_events.Schedule.rate(Duration.minutes(30)),
  public: true,
  queue: true,
});

const url = worker.url;
const queue = worker.queue;

if (!url) {
  throw new Error("Expected 'worker.url' to be defined since 'public' is true");
}

if (!queue) {
  throw new Error("Expected 'worker.queue' to be defined since 'queue' is true");
}

const trigger = new aws_lambda.Function(stack, "Test", {
  runtime: aws_lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",
  code: aws_lambda.Code.fromAsset("./test-handler"),
  timeout: Duration.seconds(30),
  environment: {
    FUNCTION_ARN: worker.functionArn,
    FUNCTION_URL: url,
    QUEUE_URL: queue.queueUrl,
  }
})

worker.grantInvoke(trigger);

worker.queue?.grantSendMessages(trigger);
worker.queue?.grant(trigger, "sqs:GetQueueAttributes");
