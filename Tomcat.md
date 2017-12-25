# Tomcat部署网页
***

## Precondition
* Ubuntu 16.04
* Java 8
* vim
* zsh

## Install
#### Step0 安装java8
```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
 sudo apt-get install oracle-java8-installer
```
使用一下命令查看现在的java版本，若不是对应的，可以选择修改成相应的~~~~
```
sudo update-alternatives --config java
```
#### Step1 创建Tomcat用户
创建tomcat用户，放在tomcat的组中，不给予登录的权限，目录是 /opt/tomcat
```
sudo groupadd tomcat
sudo useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat
```

#### Step2 安装tomcat
切换到一个 /tmp（一个重启里面的东西就没有的目录），从 [官网](http://tomcat.apache.org/download-80.cgi)上下载需要的版本的后缀为 tar.gz文件，然后安装到用户 /opt/tomcat的目录下。这本文的时候最新版本是 8.5.8

```
cd /tmp
axel -n 10 http://www-eu.apache.org/dist/tomcat/tomcat-8/v8.5.8/bin/apache-tomcat-8.5.8.tar.gz
sudo mkdir /opt/tomcat
sudo tar xzvf apache-tomcat-8.5.8.tar.gz -C /opt/tomcat --strip-components=1
```

#### Step3 更新目录权限
为了方便查看部署，因而修改相关目录的权限
让 /opt/tomcat的组设置为tomcat，其次使得 conf目录下所有的文件都可以被查看，而文件夹+x是问了让文件夹可以被进入。还有一些目录是为了方便被部署而修改了其拥有者为tomcat
```
cd /opt/tomcat
sudo chgrp -R tomcat /opt/tomcat
sudo chmod -R g+r conf
sudo chmod g+x conf
sudo chown -R tomcat webapps/ work/ temp/ logs/
```

#### Step4 创建系统服务
因为我们是手动下需要的文件到本地，因而需要将tomcat设置为系统服务方便**启动**
在此之前我们需要得到 JAVA_HOME的路径，先查看系统默认使用的java，然后适当修改相应的配置文件

```
sudo update-java-alternatives -l  // 查看默认的java路径
sudo vim /etc/systemd/system/tomcat.service
```
tomcat.service的配置文件如下，需要修改的地方只有 [Service]下面的JAVA_HOME，要根据你的JAVA_HOME来修改
```
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking

Environment=JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/jre
Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid
Environment=CATALINA_HOME=/opt/tomcat
Environment=CATALINA_BASE=/opt/tomcat
Environment='CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC'
Environment='JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom'

ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh

User=tomcat
Group=tomcat
UMask=0007
RestartSec=10
Restart=always

[Install]
WantedBy=multi-user.target
```

然后重载系统服务的配置文件，启动tomcat
```
sudo systemctl daemon-reload
sudo systemctl start tomcat
sudo systemctl status tomcat // 查看tomcat启动的状态
```
若是想让tomcat开机自动启动，可以运行
```
sudo systemctl enable tomcat
```
取消开机启动
```
sudo systemctl disable tomcat
```

#### Step 6 修改配置文件
此处的配置文件指的是登录tomcat后台进行管理的配置文件，主要有三个
第一个管理后台登录的帐号密码权限
第二个管理登录manager的ip地址
第三个管理host-manager的ip地址
> /opt/tomcat/conf/tomcat-users.xml
> /opt/tomcat/webapps/manager/META-INF/context.xml
> /opt/tomcat/webapps/host-manager/META-INF/context.xml
此处我们必须修改的是第一个文件 tomcat-users.xml，因为默认的是没有账户号码可以登录后台的，这样的设计可能是出于安全
此处设置是增加一个帐号为admin，密码为password的账户，权限是manager-gui和admin-gui，意味着两个页面都可以登录
```
<tomcat-users . . .>
    <user username="admin" password="password" roles="manager-gui,admin-gui"/>
</tomcat-users>
```

#### Step 7 两个后台管理页面
##### 后台部署页面
部署的后台路径： http://localhost:8080/manager/html
以上这个后台网页可以直接部署war包，但是**注意**了，访问这个war包的网页的时候需要在localhost:8080/后面加上文件名再加上相应的路径才能访问
下图的deploy选项选择war包的位置就可以部署了，很方便
![部署界面](./Image/manager_gui_2.png)
若是想直接访问根目录就能访问到网页，也就是以下效果，需要按照以下进行配置
![部署的项目](./Image/manager_gui_1.png)
在本文中tomcat的配置文件在 /opt/tomcat/conf/server.conf，在 Host 中加入 Context的条目
**特别小心**， docBase是项目 **编译好的文件所在的目录**，一般是文件的target下面！！

```
<Host name="localhost"  appBase="webapps" unpackWARs="true" autoDeploy="true"
    xmlValidation="false" xmlNamespaceAware="false">
    ......
    <Context path="" docBase="your_Path" debug="0" reloadable="true" />
</Host>
```
* path 是访问网页的路径
* docBase 是编译好的文件的路径
* debug 是运行的报错的等级
* reloadable 是一旦项目改变并且编译，那么会自动加载

##### 后台ip管理页面
管理ip：http://localhost:8080/host-manager/html
这个没多了解


### 参考资料
1. [Ubuntu16.04 install tomcat8](https://www.digitalocean.com/community/tutorials/how-to-install-apache-tomcat-8-on-ubuntu-16-04)