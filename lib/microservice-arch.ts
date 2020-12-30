import { Construct } from "@aws-cdk/core"
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs'
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecr from '@aws-cdk/aws-ecr';

export interface ServiceStackProps {
  cluster: ecs.ICluster;
  alb: lb.IApplicationLoadBalancer;
  repo: ecr.IRepository;
}

export class ServiceStack extends Construct {
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id);

    const orderTask = new ecs.TaskDefinition(this, 'OrderTask', {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: '256',
        memoryMiB: '512'
      })

      const orderContainer = orderTask.addContainer('OrderContainer', {
        image: ecs.ContainerImage.fromEcrRepository(props.repo)
      })

      orderContainer.addPortMappings({
        containerPort: 8000
      })

      const orderService = new ecsPatterns.ApplicationLoadBalancedFargateService(
          this,
          'OrderService', {
        cluster: props.cluster,
        taskDefinition: orderTask,
        loadBalancer: props.alb,
        assignPublicIp: true
      })
    }
}

