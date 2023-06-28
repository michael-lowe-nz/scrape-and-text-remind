import { Duration, CustomResource } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as constructs from "constructs";

interface IntegrationTestsProps {
  testEntry: string;
  timeout: Duration;

  /** These values will be passed into the context of your tests */
  properties?: Record<string, string>;
}

export class IntegrationTests
  extends constructs.Construct
  // eslint-disable-next-line prettier/prettier
  implements iam.IGrantable {
  private handler: lambda.IFunction;

  constructor(
    scope: constructs.Construct,
    id: string,
    props: IntegrationTestsProps
  ) {
    super(scope, id);

    this.handler = new nodeLambda.NodejsFunction(this, "TestRunner", {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: props.timeout,
      bundling: {
        define: {
          "process.env.TEST_FILE": `"${props.testEntry}"`,
        },
      },
    });

    new CustomResource(this, "IntegrationTestResource", {
      serviceToken: this.handler.functionArn,
      properties: {
        ...props.properties,
        Version: new Date().toISOString(),
      },
    });
  }

  get grantPrincipal(): iam.IPrincipal {
    return this.handler.grantPrincipal;
  }
}
