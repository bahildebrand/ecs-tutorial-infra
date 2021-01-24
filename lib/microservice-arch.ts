import { Construct } from "@aws-cdk/core"
import * as ec2 from '@aws-cdk/aws-ec2'
import * as ecs from '@aws-cdk/aws-ecs'
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecr from '@aws-cdk/aws-ecr';
import { ListenerAction } from "@aws-cdk/aws-elasticloadbalancingv2";
import { RepositoryImage } from "@aws-cdk/aws-ecs";

export interface ServiceStackProps {
  cluster: ecs.ICluster;
  alb: lb.IApplicationLoadBalancer;
  repo: ecr.IRepository;
  vpc: ec2.Vpc;
  uri: string;
  listener: lb.ApplicationListener;
  priority: number
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

    const service = new ecs.FargateService(this, "service", {
      cluster: props.cluster,
      taskDefinition: task,
      desiredCount: 1,
      assignPublicIp: true
    });

    service.connections.allowFrom(props.alb, ec2.Port.tcp(80));
    props.alb.connections.allowTo(service, ec2.Port.tcp(80));

    const tg = new lb.ApplicationTargetGroup(this, "TargetGroup", {
      targets: [service],
      protocol: lb.ApplicationProtocol.HTTP,
      port: 8000,
      vpc: props.vpc
    });

    const rule = new lb.ApplicationListenerRule(this, "Listener", {
      listener: props.listener,
      priority: props.priority,
      conditions: [lb.ListenerCondition.pathPatterns([props.uri])],
      targetGroups: [tg],
    })
  }
}

