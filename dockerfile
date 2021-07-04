# use builder
# 第一階段產生dist資料夾
FROM node:alpine as builder

# 指定預設/工作資料夾
WORKDIR /usr/app

# 只copy package.json檔案
COPY ./package*.json ./
# 安裝dependencies
RUN npm install

# copy其餘目錄及檔案
COPY ./ ./

COPY src src

# 指定建立build output資料夾，--prod為Production Mode
RUN npm run build


# pull nginx image
FROM nginx:alpine

# 從第一階段的檔案copy
COPY --from=0 /usr/app/dist/ProjectOne /usr/share/nginx/html

# 覆蓋image裡的設定檔
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80


# ------ local ---------
# FROM nginx:alpine

# # 將編譯好的網頁原始碼複製到根目錄
# COPY ./dist/ProjectOne /usr/share/nginx/html

# # 覆蓋image裡的設定檔
# COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80