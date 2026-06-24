FROM nginx:alpine
COPY CSS/ /usr/share/nginx/html/CSS/
COPY HTML/ /usr/share/nginx/html/HTML/
COPY JS/ /usr/share/nginx/html/JS/
COPY resources/ /usr/share/nginx/html/resources/
COPY testData/ /usr/share/nginx/html/testData/
EXPOSE 80