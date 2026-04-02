FROM nginx:alpine

WORKDIR /var/www

COPY build /var/www/monexup.com
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
