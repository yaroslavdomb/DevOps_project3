pipeline {
    agent {
        kubernetes {
            cloud 'kubernetes-cloud'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  hostAliases:
  - ip: "10.96.33.186"
    hostnames:
    - "nexus.local"
  containers:
  - name: git-tools
    image: alpine/git:latest
    command: ['cat']
    tty: true
'''
        }
    }

    parameters {
        string(name: 'TAG', defaultValue: '', description: 'Build number produced by build-backend')
    }

    environment {
        REPO_OWNER   = 'yaroslavdomb'
        REPO_NAME    = 'DevOps_project3'
        DEPLOY_FILE  = 'infra-repo/kubernetes/deployments/back-deployment.yaml'
        IMAGE_NAME   = 'be-img'
        NEXUS_HOST   = 'nexus.local'
        NEXUS_REPO   = 'nexus-repo'
    }

    stages {
        stage('Prepare tools') {
            steps {
                container('git-tools') {
                    sh 'apk add --no-cache curl jq'
                }
            }
        }

        stage('Open PR: code DEV -> MAIN') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        script {
                            def existing = sh(
                                script: '''
                                    curl -s -H "Authorization: token ${GIT_PASS}" \
                                      "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?head=${REPO_OWNER}:DEV&base=main&state=open" \
                                      | jq -r '.[0].number // empty'
                                ''',
                                returnStdout: true
                            ).trim()

                            if (existing) {
                                env.PR_NUMBER = existing
                            } else {
                                def created = sh(
                                    script: '''
                                        curl -s -X POST \
                                          -H "Authorization: token ${GIT_PASS}" \
                                          -H "Accept: application/vnd.github+json" \
                                          https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls \
                                          -d "{\\"title\\":\\"CD: backend code DEV -> MAIN\\",\\"head\\":\\"DEV\\",\\"base\\":\\"main\\",\\"body\\":\\"Automated code merge, triggered by build ${TAG}\\"}" \
                                          | jq -r '.number'
                                    ''',
                                    returnStdout: true
                                ).trim()
                                env.PR_NUMBER = created
                            }
                        }
                        echo "PR number: ${env.PR_NUMBER}"
                    }
                }
            }
        }

        stage('Approve PR') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'review-github', usernameVariable: 'REVIEW_USER', passwordVariable: 'REVIEW_PASS')]) {
                        sh '''
                            curl -s -X POST \
                              -H "Authorization: token ${REVIEW_PASS}" \
                              -H "Accept: application/vnd.github+json" \
                              https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${PR_NUMBER}/reviews \
                              -d "{\\"event\\":\\"APPROVE\\"}"
                        '''
                    }
                }
            }
        }

        stage('Merge PR (code only)') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh '''
                            git clone https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git repo-merge
                            cd repo-merge
                            git config user.name "p3_jenkins-ydomb_autoReviewer"
                            git config user.email "p3_jenkins-ydomb_autoReviewer@local"
                            
                            git fetch origin main DEV
                            git checkout main
                            
                            git merge origin/DEV -X theirs -m "Merge branch 'DEV' into main with priority [skip ci]" || true
                            git add .
                            git commit -m "Merge branch 'DEV' into main with priority [skip ci]" || echo "Nothing to commit"
                            git push https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git main
                        '''
                    }
                }
            }
        }

        stage('Update tag: MAIN') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh '''
                            git clone --branch main --single-branch \
                              https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git repo-main
                            cd repo-main
                            git config user.name "p3_jenkins-ydomb_autoReviewer"
                            git config user.email "p3_jenkins-ydomb_autoReviewer@local"
                            sed -i \
                              -e "s#image: nexus.local/${IMAGE_NAME}:.*#image: nexus.local/${IMAGE_NAME}:${TAG}#" \
                              ${DEPLOY_FILE}
                            git add ${DEPLOY_FILE}
                            git commit -m "CD: backend image tag -> ${TAG}" || echo "Nothing to commit"
                            git push https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git main
                        '''
                    }
                }
            }
        }

        stage('Update tag: DEV') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                        sh '''
                            git clone --branch DEV --single-branch \
                              https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git repo-dev
                            cd repo-dev
                            git config user.name "p3_jenkins-ydomb_autoReviewer"
                            git config user.email "p3_jenkins-ydomb_autoReviewer@local"
                            sed -i \
                              -e "s#image: nexus.local/${IMAGE_NAME}:.*#image: nexus.local/${IMAGE_NAME}:${TAG}#" \
                              ${DEPLOY_FILE}
                            git add ${DEPLOY_FILE}
                            git commit -m "CD: backend image tag -> ${TAG}" || echo "Nothing to commit"
                            git push https://${GIT_USER}:${GIT_PASS}@github.com/${REPO_OWNER}/${REPO_NAME}.git DEV
                        '''
                    }
                }
            }
        }

        stage('Cleanup old images') {
            steps {
                container('git-tools') {
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh '''
                            curl -s -u ${NEXUS_USER}:${NEXUS_PASS} "http://${NEXUS_HOST}/service/rest/v1/search?repository=${NEXUS_REPO}&name=${IMAGE_NAME}" \
                            | jq -r '[.items[] | select(.version != "latest")] | sort_by(.version | tonumber) | reverse | .[3:] | .[].id' \
                            > old_ids.txt

                            while read id; do
                                curl -s -u ${NEXUS_USER}:${NEXUS_PASS} -X DELETE "http://${NEXUS_HOST}/service/rest/v1/components/$id"
                            done < old_ids.txt
                        '''
                    }
                }
            }
        }
    }
}
