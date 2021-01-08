import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as S3PrivateBucketForTrail from '../lib/s3-private-bucket-for-trail-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new S3PrivateBucketForTrail.S3PrivateBucketForTrailStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
