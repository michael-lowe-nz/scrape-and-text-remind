import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cr from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";

export interface TestStackProps extends cdk.StackProps {
  RemindLambdaFunction: lambda.IFunction | null;
}

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TestStackProps) {
    super(scope, id, props);

    if (props.RemindLambdaFunction) {
      const invoker = new cr.AwsCustomResource(this, "CustomResource", {
        onUpdate: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: props.RemindLambdaFunction.functionName,
            Payload: JSON.stringify({
              message: "Hello from CDK!",
            }),
          },
          physicalResourceId: cr.PhysicalResourceId.of(`${new Date()}`),
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      });

      props.RemindLambdaFunction.grantInvoke(invoker);
    }
  }
}
