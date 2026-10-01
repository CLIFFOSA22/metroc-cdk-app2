import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MetrocCdkApp2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // A KMS Key
    const myKey = new kms.Key(this, 'MyKey', {
      enableKeyRotation: true,
      rotationPeriod: cdk.Duration.days(180),
    });

    // S3 Bucket with versioning and KMS encryption
    const bucket = new s3.Bucket(this, 'Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: myKey,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // IAM Role assumed by EC2
    const userRole = new iam.Role(this, 'UserRole', {
      roleName: 'metroc-iam-role',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // EC2 Full Access
    userRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess')
    );

    // S3 Full Access
    userRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
    );
  }
}