import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecr from '@aws-cdk/aws-ecr';

export class EcsTutorialInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: "10.0.0.0/16",
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    })

    const alb = new lb.ApplicationLoadBalancer(this, 'ALB', {
      vpc: vpc
    })

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc
    })

    const tutorialRepository = new ecr.Repository(this, 'Repository');

    const orderTask = new ecs.TaskDefinition(this, 'OrderTask', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512'
    })

    const orderContainer = orderTask.addContainer('OrderContainer', {
      image: ecs.ContainerImage.fromEcrRepository(tutorialRepository)
    })

    orderContainer.addPortMappings({
      containerPort: 8000
    })

    const orderService = new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        'OrderService', {
      cluster: cluster,
      taskDefinition: orderTask,
      loadBalancer: alb,
      assignPublicIp: true
    })

  }
}
