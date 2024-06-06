import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as event_sources from 'aws-cdk-lib/aws-lambda-event-sources';

export interface DoubleEdgedLambdaProps extends lambda.FunctionProps {
  /**
   * An optional API gateway resource to associate with this function. If defined, a GET method will
   * be added to this resource and the function will be attached to the method.
   *
   * @default - no resource is associated with the function.
   */
  apiResource?: apigw.IResource;

  /**
   * Options for the SQS queue that will be created for this function.
   * 
   * @default - default options
   */
  queueOptions?: sqs.QueueProps;
}

export class DoubleEdgedLambda extends lambda.Function {
  public queue: sqs.Queue;
  constructor(scope: Construct, id: string, props: DoubleEdgedLambdaProps) {
    super(scope, id, props);
    props.apiResource?.addMethod("GET", new apigw.LambdaIntegration(this));
    this.queue = new sqs.Queue(this, 'Queue', props.queueOptions);
    this.addEventSource(new event_sources.SqsEventSource(this.queue));
  }
}
