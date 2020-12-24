#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsTutorialInfraStack } from '../lib/ecs-tutorial-infra-stack';

const app = new cdk.App();
new EcsTutorialInfraStack(app, 'EcsTutorialInfraStack');
