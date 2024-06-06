import { App, Duration, Stack, aws_apigateway, aws_lambda } from 'aws-cdk-lib';
import { DoubleEdgedLambda } from '../lib/index';
import { TriggerFunction } from 'aws-cdk-lib/triggers';

const app = new App();
const stack = new Stack(app, 'DoubleEdgedLambdaTestStack');

const api = new aws_apigateway.RestApi(stack, "Api");

const del = new DoubleEdgedLambda(stack, "DoubleEdgedLambda", {
  code: aws_lambda.Code.fromAsset("./handler"),
  runtime: aws_lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",
  apiResource: api.root,
});


const trigger = new TriggerFunction(stack, "Test", {
  runtime: aws_lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",
  code: aws_lambda.Code.fromAsset("./test-handler"),
  timeout: Duration.seconds(30),
  environment: {
    FUNCTION_ARN: del.functionArn,
    QUEUE_URL: del.queue.queueUrl,
    API_URL: api.url,
  }
})

del.grantInvoke(trigger);

del.queue.grantSendMessages(trigger);
del.queue.grant(trigger, "sqs:GetQueueAttributes");
