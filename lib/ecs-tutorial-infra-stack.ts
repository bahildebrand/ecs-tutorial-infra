import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecr from '@aws-cdk/aws-ecr';
import * as sd from "@aws-cdk/aws-servicediscovery";
import { ServiceStack } from './microservice-arch';
import { ListenerAction } from '@aws-cdk/aws-elasticloadbalancingv2';
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

    const namespace = new sd.PrivateDnsNamespace(this, "Namespace", {
      name: "hello-world",
      vpc: vpc
    });

    const service = namespace.createService('Service', {
      dnsRecordType: sd.DnsRecordType.A_AAAA,
      dnsTtl: cdk.Duration.seconds(30),
      loadBalancer: true,
      name: 'hello-world'
    });

    const alb = new lb.ApplicationLoadBalancer(this, 'ALB', {
      vpc: vpc,
      internetFacing: true
    });

    const listener = new lb.ApplicationListener(this, "Listener", {
      loadBalancer: alb,
      port: 80,
      defaultAction: ListenerAction.fixedResponse(404)
    });


    service.registerLoadBalancer('Loadbalancer', alb);

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc
    })

    let priority = 10;
    // const orderRepo = new ecr.Repository(this, 'OrderRepository');
    const helloRepo = ecr.Repository.fromRepositoryName(this, "HelloRepo",
      "hello-service");

    const helloService = new ServiceStack(this, 'HelloService', {
      cluster: cluster,
      alb: alb,
      repo: helloRepo,
      vpc: vpc,
      uri: '/hello/*',
      listener: listener,
      priority: priority++
    });

    const worldRepo = ecr.Repository.fromRepositoryName(this,
      "WorldRepo",
      "world-service");

    const worldServiceName = 'WorldService';
    const worldService = new ServiceStack(this, worldServiceName, {
      cluster: cluster,
      alb: alb,
      repo: worldRepo,
      vpc: vpc,
      uri: '/world/*',
      listener: listener,
      priority: priority++
    });
  }
}
