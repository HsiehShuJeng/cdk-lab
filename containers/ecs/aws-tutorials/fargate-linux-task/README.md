# Welcome to your CDK TypeScript project

1. List task definition
    ```sh
    aws ecs list-task-definitions --profile ${PROFILE_NAME}
    ```
2. list services
    ```sh
    aws ecs list-services --cluster fargate-cluster --profile ${PyROFILE_NAME}
    ```
    ```txt
    {
        "serviceArns": [
            "arn:aws:ecs:ap-northeast-1:${ACCOUNT_ID}:service/fargate-cluster/fargate-service"
        ]
    }
    ```
3. describe the running service
    ```sh
    aws ecs describe-services --cluster fargate-cluster --services fargate-service --profile ${PROFILE_NAME}
    ```
4. 
    test
    ```sh
    aws ecs describe-tasks --cluster fargate-cluster --tasks ${TASK_ARN} --profile ${PROFILE_NAME}
    ```
    ```sh
    aws ec2 describe-network-interfaces \
        --network-interface-id eni-0c6c9dc67607d9869 \
        --profile ${PROFILE_NAME}
    ```