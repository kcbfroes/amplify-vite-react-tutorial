FROM gitpod/workspace-full
			                        
# install aws-cli v2
RUN sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install

# install amplify-cli
RUN sudo curl -sL https://aws-amplify.github.io/amplify-cli/install | bash && $SHELL