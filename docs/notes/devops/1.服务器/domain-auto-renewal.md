---
title: SSL证书续期
createTime: 2025/07/20 11:49:37
permalink: /devops/server/domain-auto-renewal/
badge: 域名
---

## 概述

现在市面域名免费的SSL的证书都由原来的``1年``缩短为``90天``，故采用外部插件实现SSL自动续期功能。

## 插件介绍

[acme.sh](https://github.com/acmesh-official/acme.sh)实现，自动化SSL证书续期，生成``cert``,并且重启项目服务。

## 插件应用

### 安装


 ``` bash
 # 国内服务器使用此地址
 git clone https://gitee.com/neilpang/acme.sh.git
 ```

 ### 运行acme.sh

 ``` bash
 # 进入目录
 cd ./acme.sh
 # 启动sh
 ./acme.sh --install -m my@example.com
 ```
安装程序将执行 3 项操作：
- 创建 acme.sh 并将其复制到主目录 ($HOME)： ~/.acme.sh/. ==所有证书也将放在此文件夹中==。
- 创建==别名==：acme.sh=~/.acme.sh/acme.sh。
- 创建==每日 cron 作业==，以便在需要时检查和更新证书

**定时任务**
``` bash
crontab -l
# 每天凌晨38分检查证书是否即将过期
38 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null

# 可查看help
acme.sh -h
```

### **HTTP**验证（签发证书）

``` bash
# Single domain
acme.sh --issue -d example.com -w /home/wwwroot/example.com

# Multiple domains in the same cert
acme.sh --issue -d example.com -d www.example.com -d cp.example.com -w /home/wwwroot/example.com
```
**参数解析：**
- --issue：表示发起证书申请流程。
- -d example.com：指定要申请证书的域名（-d 是 --domain 的缩写）。
- -w /home/wwwroot/example.com：指定网站根目录路径（-w 是 --webroot 的缩写），acme.sh 会在该目录下==自动创建验证文件==（路径为 /.well-known/acme-challenge/xxx）。

**关键要求：**
- 网站根目录权限：acme.sh 需要对 -w 指定的目录有==写入权限==（才能创建验证文件）。
- 域名绑定：所有通过 -d 指定的域名，必须解析到当前服务器，且 HTTP 服务（80 端口）可正常访问（验证文件需通过 HTTP 公开访问）。
- 单根目录限制：多个域名必须绑定到同一个网站根目录（因为验证文件仅存放在一个目录中）。

**证书存放路径：**
- 申请成功后，证书文件会保存在``~/.acme.sh/域名/``目录下（如 ~/.acme.sh/example.com/），包含证书（.cer）、私钥（.key）、完整证书链（fullchain.cer）等文件。

**自动续期：**
- 证书默认有效期为``90天``，acme.sh 会通过 cron 定时任务 ==每60天自动检查==并续期（确保在过期前完成更新）

### DNS验证（签发证书）

[dnsapi](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)

``` bash
# 不同 DNS 提供商需配置不同的 API 密钥。例如，使用阿里云 DNS
export Ali_Key="你的阿里云 AccessKey ID"
export Ali_Secret="你的阿里云 AccessKey Secret"
# 签发证书
./acme.sh --issue --dns dns_ali -d example.com -d *.example.com
```

**参数说明**
- --dns dns_ali：使用阿里云 DNS 验证（根据提供商修改）。
- -d example.com：主域名。
- -d *.example.com：通配符域名（可选，需 DNS 验证）。

**额外检查项**
- 要保证你使用的 AccessKey 具备管理 DNS 记录的权限。
- 建议为证书申请创建专门的子账户，并授予``AliyunDNSFullAccess``权限。

**证书存放路径：**
- 申请成功后，证书文件会保存在``~/.acme.sh/域名/``目录下（如 ~/.acme.sh/example.com/），包含证书（.cer）、私钥（.key）、完整证书链（fullchain.cer）等文件。

**自动续期：**
- 证书默认有效期为``90天``，acme.sh 会通过 cron 定时任务 ==每60天自动检查==并续期（确保在过期前完成更新）

### Apache/Nginx应用

证书生成后，你可能想将证书安装/拷贝到 Apache/Nginx 或其他服务器上。 ==请勿使用``~/.acme.sh/``文件夹中的证书文件，它们仅供内部使用==，文件夹结构将来可能会改变。

**Apache example:**
``` bash
acme.sh --install-cert -d example.com \
--cert-file      /path/to/certfile/in/apache/cert.pem  \
--key-file       /path/to/keyfile/in/apache/key.pem  \
--fullchain-file /path/to/fullchain/certfile/apache/fullchain.pem \
--reloadcmd     "service apache2 force-reload"
```

**Nginx example:**
``` conf
acme.sh --install-cert -d example.com \
--key-file       /path/to/keyfile/in/nginx/key.pem  \
--fullchain-file /path/to/fullchain/nginx/cert.pem \
--reloadcmd     "service nginx force-reload"
```

### Nginx conf配置
``` bash
server {
    listen 443 ssl;
    server_name example.com www.examnple.cn;
    
    # access_log  /var/log/nginx/host.access.log  main;

    # 证书路径（使用 fullchain.cer 和私钥）
    ssl_certificate /etc/nginx/ssl/example.com/fullchain.cer;
    ssl_certificate_key /etc/nginx/ssl/example.com/example.com.key;


    # 可选：添加 SSL 优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        root   /usr/share/nginx/html/root;
        index  index.html index.htm;
    }

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}

# HTTP 重定向（可选，推荐）
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;  # 强制跳转到 HTTPS
}
```
