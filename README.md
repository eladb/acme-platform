# Double Edged Lambda Construct Library Example

This is an example of an AWS CDK construct library that exposes an abstraction for an AWS Lambda
function that can be invoked either through an API Gateway or via an SQS queue (or directly).

![architecture](image.png)

## Usage

Import the `DoubleEdgeLambda` construct from this library and use as follows:

```ts
import { ServerlessWorkload } from '@acme/platform';
import { App, Stack, aws_lambda } from 'aws-cdk-lib';

const app = new App();
const stack = new Stack(app, 'MyStack');

const workload = new ServerlessWorkload(stack, "MyWorkload", {
  // -- required --
  code: aws_lambda.Code.fromAsset("./handler"),
  runtime: aws_lambda.Runtime.NODEJS_20_X,
  handler: "index.handler",

  // -- optional --

  // exposes this workload via a public URL
  public: true,

  // exposes this workload via an SQS queue
  queue: true,

  // triggers this workload on a schedule
  schedule: aws_events.Schedule.rate(Duration.minutes(30)),
});

const functionUrl = workload.url;
const queueUrl = workload.queue.queueUrl;


```



## License

Apache 2.0