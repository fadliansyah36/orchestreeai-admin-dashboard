# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_BACKEND_API_URL=https://api.orchestree.biz.id/api/v1
ARG NEXT_PUBLIC_BACKEND_API_URL=https://api.orchestree.biz.id/api/v1
ARG VITE_SUPABASE_URL=https://exfvfyiwftywqjcsofgf.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder
ENV VITE_BACKEND_API_URL=${VITE_BACKEND_API_URL:-$NEXT_PUBLIC_BACKEND_API_URL}
ENV NEXT_PUBLIC_BACKEND_API_URL=${NEXT_PUBLIC_BACKEND_API_URL:-$VITE_BACKEND_API_URL}
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
