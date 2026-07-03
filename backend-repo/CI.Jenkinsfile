pipeline {
    agent {
        kubernetes {
            cloud 'kubernetes-cloud'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  hostAliases:
  - ip: "10.96.137.183"
    hostnames:
    - "nexus.local"
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['cat']
    tty: true
    volumeMounts:
    - name: registry-creds
      mountPath: /kaniko/.docker
  volumes:
  - name: registry-creds
    secret:
      secretName: kaniko-nexus-secret
      items:
      - key: .dockerconfigjson
        path: config.json
'''
        }
    }
    stages {
        stage('Build and Push Backend') {
            steps {
                container('kaniko') {
                    sh '/kaniko/executor --context=dir://./backend-repo --dockerfile=./backend-repo/Dockerfile --destination=nexus.local/be-img:${BUILD_NUMBER} --destination=nexus.local/be-img:latest --insecure'
                }
            }
            post {
                success {
                    build job: 'cd-backend', parameters: [string(name: 'TAG', value: env.BUILD_NUMBER)], wait: false
                }
            }
        }
    }
}