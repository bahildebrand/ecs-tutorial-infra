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

    const task = new ecs.TaskDefinition(this, id + 'Task', {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: '256',
        memoryMiB: '512'
      })

    const container = task.addContainer( id + 'Container', {
      image: ecs.ContainerImage.fromEcrRepository(props.repo)
    })

    container.addPortMappings({
      containerPort: 8000
    })

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        id, {
      cluster: props.cluster,
      taskDefinition: task,
      loadBalancer: props.alb,
      assignPublicIp: true
    })
  }
}

