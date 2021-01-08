import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from "@aws-cdk/aws-iam"
import * as cloudtrail from '@aws-cdk/aws-cloudtrail'

export class S3PrivateBucketForTrailStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Put/ Delete などの DataEvent を出力させたい S3 バケット
     */
    const sampleTargetBucket = new s3.Bucket(this, 'samleTargetBucket', {
      bucketName: "sublog.sample-target-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    /**
     * CloudTrail イベント格納 S3 バケット
     */
    const sampleTrailBucket = new s3.Bucket(this, 'sampleTrailBucket', {
      bucketName: 'sublog.sample-trail-bucket',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })


    /**
     * イベント格納用バケットのバケットポリシーを設定
     * https://docs.aws.amazon.com/ja_jp/awscloudtrail/latest/userguide/create-s3-bucket-policy-for-cloudtrail.html
     */
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
      actions: ['s3:GetBucketAcl'],
      resources: [sampleTrailBucket.bucketArn]
    })

    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('cloudtrail.amazonaws.com')],
      actions: ['s3:PutObject'],
      resources: [sampleTrailBucket.bucketArn + '/AWSLogs/' + this.account + '/*'],
      conditions: {"StringEquals": {"s3:x-amz-acl": "bucket-owner-full-control"}}
    })

    /**
     * ログ出力対象バケットの trail 設定を作成
     */
    const sampleTargetTrail = new cloudtrail.Trail(this, 'sampleTargetTrail', {
      bucket: sampleTrailBucket,
      /**
       * 動作確認用設定
       * S3 の PutObject/ DeleteObjects のような　DataEvent は、
       * CloudTrail コンソールで出力を確認することができないため、
       * CloudWatch Logs へ 1回吐き出したあと、 Logs Insights で条件を絞って動作確認をするといい感じ
       */
      sendToCloudWatchLogs: true,
    })

   /**
    * ↑ の trail について、出力したい S3 DataEvent のフィルター設定をする
    */
    sampleTargetTrail.addS3EventSelector([{
      bucket: sampleTargetBucket,
    }],{
      /**
       * PutObject/ DeleteObjects について、それぞれ
       * managementEvent: 0 (つまり DataEvent ) かつ
       * readOnly: 0 (つまり書き込みイベント)
       * を出力するように設定(Logs Insights にもこれを設定してフィルタリングする)
       */
      includeManagementEvents: false,
      readWriteType: cloudtrail.ReadWriteType.WRITE_ONLY,
    })
  }
}
