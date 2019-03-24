FROM nginx

RUN mkdir /etc/nginx/ssl

# In swarm, can be replaced with loaded secrets: https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose
COPY ./certs/stacy.crt /etc/nginx/ssl/stacy.crt
COPY ./certs/stacy.key /etc/nginx/ssl/stacy.key

COPY nginx.conf /etc/nginx/nginx.conf
COPY locations /etc/nginx/locations

CMD ["nginx", "-g", "daemon off;"]
