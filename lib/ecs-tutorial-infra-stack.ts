import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecs from '@aws-cdk/aws-ecs'
import * as ecr from '@aws-cdk/aws-ecr';
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

    const alb = new lb.ApplicationLoadBalancer(this, 'ALB', {
      vpc: vpc,
      internetFacing: true
    })

    const listener = new lb.ApplicationListener(this, "Listener", {
      loadBalancer: alb,
      port: 80,
      defaultAction: ListenerAction.fixedResponse(404)
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: vpc
    })

    let priority = 10;

    // const orderRepo = new ecr.Repository(this, 'OrderRepository');
    const orderRepo = ecr.Repository.fromRepositoryName(this, "OrderRepo",
      "order-repo");

    const orderService = new ServiceStack(this, 'OrderService', {
      cluster: cluster,
      alb: alb,
      repo: orderRepo,
      vpc: vpc,
      uri: '/order/*',
      listener: listener,
      priority: priority++
    });

    const inventoryRepo = ecr.Repository.fromRepositoryName(this,
      "InventoryRepo",
      "inventory-repo");

    const inventoryService = new ServiceStack(this, 'InventoryService', {
      cluster: cluster,
      alb: alb,
      repo: inventoryRepo,
      vpc: vpc,
      uri: '/inventory/*',
      listener: listener,
      priority: priority++
    });
  }
}
