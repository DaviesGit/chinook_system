server端代码仅在linux上编译通过，如果需要在windows上编译，请作相应更改。
linux 上编译命令 server/build.sh .


文件结构:
├── chinook_system                     发行版软件，linux版
│   ├── chinook_server                 服务端二进制文件 只能在liunx上运行 请在chinook_system文件夹内运行，否则无法找到依赖文件
│   ├── Chinook_Sqlite.sqlite          创建过VIEW的sqlite数据库
│   └── website                        网站根目录
├── server                             源码文件夹
│   ├── build.sh                       编译源码的命令
│   └── main.cpp                       主要源码文件
├── answer.sql                         chinook问题答案
├── create_view.sql                    用来创建VIEW的SQL
├── DFD.png                            数据流图
├── ERD.png                            实体关系图
├── gantt.png                          甘特图
├── question.txt                       chinook问题
├── readme.txt                         说明
└── 实验报告.pdf                        实验报告

