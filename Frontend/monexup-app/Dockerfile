# Stage 1: Build the React Application
FROM nginx:alpine 

WORKDIR /app

COPY . .

# Stage 2: Setup the Nginx Server to serve the React Application
#FROM nginx:alpine 

COPY build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]