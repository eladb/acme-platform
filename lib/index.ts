import { Construct } from 'constructs';
import { aws_events_targets, aws_lambda_event_sources, aws_events, aws_lambda, aws_sqs } from 'aws-cdk-lib';

export interface ServerlessWorkloadProps extends aws_lambda.FunctionProps {
  /**
   * Expose this workload via a public URL. If enabled, the `workload.url` property will return the
   * public URL of this workload. The URL will be exposed without any authentication.
   *
   * @default false
   */
  readonly public?: boolean;

  /**
   * Allow this workload to be triggered via by sending messages into an SQS queue.
   *
   * The `workload.queue` references the SQS queue that triggers this workload.
   *
   * A dead letter queue will automatically be associated with the SQS queue and can be accessed via
   * the `workload.deadLetterQueue` property.
   *
   * @default false
   */
  readonly queue?: boolean;

  /**
   * Additional options for the queue.
   * @default - default options
   */
  readonly queueOptions?: aws_sqs.QueueProps;  

  /**
   * Trigger this workload on a schedule.
   * @default - no scheduled trigger
   */
  readonly schedule?: aws_events.Schedule;
}

/**
 * A serverless workload that can be deployed to AWS Lambda.
 */
export class ServerlessWorkload extends aws_lambda.Function {
  /**
   * The SQS queue associated with the workload, if `queue` is enabled.
   */
  public queue?: aws_sqs.Queue;

  /**
   * The dead letter queue associated with the workload's queue, if `queue` is enabled.
   */
  public deadLetterQueue?: aws_sqs.Queue;

  /**
   * The public URL of the workload, if `public` is enabled.
   */
  public url?: string;

  constructor(scope: Construct, id: string, props: ServerlessWorkloadProps) {
    super(scope, id, props);

    if (props.public ?? false) {
      const url = this.addFunctionUrl({
        authType: aws_lambda.FunctionUrlAuthType.NONE,
        cors: {
          allowedOrigins: ['*'],
          allowedMethods: [aws_lambda.HttpMethod.ALL],
        },
      });

      this.url = url.url;
    }

    if (props.queue ?? false) {
      const dlq = new aws_sqs.Queue(this, 'DeadLetterQueue');

      this.queue = new aws_sqs.Queue(this, 'Queue', {
        deadLetterQueue: {
          queue: dlq,
          maxReceiveCount: 3,
        },
        ...props.queueOptions,
      });

      this.addEventSource(new aws_lambda_event_sources.SqsEventSource(this.queue));
      this.deadLetterQueue = dlq;
    }

    if (props.schedule) {
      const schedule = new aws_events.Rule(this, 'Schedule', {
        schedule: props.schedule,
      });

      schedule.addTarget(new aws_events_targets.LambdaFunction(this));
    }
  }
}
