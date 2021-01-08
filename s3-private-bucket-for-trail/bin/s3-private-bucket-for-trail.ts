#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3PrivateBucketForTrailStack } from '../lib/s3-private-bucket-for-trail-stack';

const app = new cdk.App();
new S3PrivateBucketForTrailStack(app, 'S3PrivateBucketForTrailStack');
