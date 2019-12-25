FROM php:alpine

WORKDIR app
COPY . /app/

# Add basics first
RUN \
  apk add --no-cache apache2 php-apache2 php-json \
  && sed -i "s/#LoadModule\ rewrite_module/LoadModule\ rewrite_module/" /etc/apache2/httpd.conf \
  && sed -i "s/#LoadModule\ session_module/LoadModule\ session_module/" /etc/apache2/httpd.conf \
  && sed -i "s/#LoadModule\ session_cookie_module/LoadModule\ session_cookie_module/" /etc/apache2/httpd.conf \
  && sed -i "s/#LoadModule\ session_crypto_module/LoadModule\ session_crypto_module/" /etc/apache2/httpd.conf \
  && sed -i "s/#LoadModule\ deflate_module/LoadModule\ deflate_module/" /etc/apache2/httpd.conf \
  && sed -i "s#^DocumentRoot \".*#DocumentRoot \"/app/web-root\"#g" /etc/apache2/httpd.conf \
  && sed -i "s#/var/www/localhost/htdocs#/app/web-root#" /etc/apache2/httpd.conf \
  && printf "\n<Directory \"/app/web-root\">\n\tAllowOverride All\n</Directory>\n" >> /etc/apache2/httpd.conf \
  && chown -R www-data:www-data /app && chmod -R 755 /app \
  && sed -i "s/index.html/index.php/g" /etc/apache2/httpd.conf \
  && chmod +x /app/start.sh

EXPOSE 80
ENTRYPOINT ["/app/start.sh"]
