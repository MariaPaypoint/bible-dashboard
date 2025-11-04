FROM node:18.19.1-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы
COPY . .

# Открываем порт Vite
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev"]
