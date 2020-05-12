FROM nginx

RUN mkdir /etc/nginx/ssl

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./locations /etc/nginx/locations

COPY ./bin/wait-for-it.sh wait-for-it.sh

CMD ["nginx", "-g", "daemon off;"]
