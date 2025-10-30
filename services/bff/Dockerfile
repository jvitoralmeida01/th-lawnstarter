FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev supervisor \
 && docker-php-ext-install pdo pdo_pgsql zip \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-interaction --prefer-dist --no-progress
RUN php -r "file_exists('.env') || copy('.env.example', '.env');" \
 && php artisan key:generate || true

COPY supervisord.conf /etc/supervisor/conf.d/app.conf

EXPOSE 8080
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
