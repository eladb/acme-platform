# The `ServerlessWorkload` Construct Library

This is an example of an AWS CDK construct library which exposes an abstraction for a "serverless
workload" based on AWS Lambda. Workloads can be triggered via a public URL, SQS queue or on
schedule.

## Usage

Import the `ServerlessWorkload` construct from this library and use as follows:

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

```

Properties:

* The `workload.url` is the public URL exposed by the workload.
* The `workload.queue` is the SQS queue defined for this workload. You can send messages to this
  queue to trigger the workload.

## License

Apache 2.0