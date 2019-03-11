FROM nginx

RUN mkdir /etc/nginx/ssl
COPY nginx.crt /etc/nginx/ssl/nginx.crt
COPY nginx.key /etc/nginx/ssl/nginx.key

COPY nginx.conf /etc/nginx/nginx.conf
COPY locations /etc/nginx/locations

CMD ["nginx", "-g", "daemon off;"]
