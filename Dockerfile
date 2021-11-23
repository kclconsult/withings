FROM node:11
ENV user node
USER $user
WORKDIR /home/$user
COPY --chown=$user:$user package.json .
COPY --chown=$user:$user lib/messages ./lib/messages
ENV NODE_ENV production
RUN npm ci --only=production --loglevel=silly
COPY --chown=$user:$user . .
EXPOSE 3000
CMD ["npm", "start"]
