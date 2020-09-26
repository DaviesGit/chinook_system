
cmake_minimum_required(VERSION 3.7)
#设置项目名称
project(chinook_server)
#设置Find_Package()路径
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH}
"${CMAKE_CURRENT_SOURCE_DIR}/cmake")

#设置 pthread
SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -pthread")

#查找需要的SQLite3库文件
MESSAGE("======Searching for SQLite3======")
find_package (SQLite3)
if (SQLITE3_FOUND)
MESSAGE(${SQLITE3_INCLUDE_DIRS})
MESSAGE(${SQLITE3_LIBRARIES})
MESSAGE("======SUCCESS FOUND SQLite3======")
else (SQLITE3_FOUND)
MESSAGE("====== NOT FOUND SQLite3 ======")
endif (SQLITE3_FOUND)#如果找到了第三方库,后续步骤有效,否则将报错并退出项目构建!
#将第三方库头文件附加到变量Projects_Extra_Includes中,便于管理
list(APPEND Projects_Extra_Includes
${SQLITE3_INCLUDE_DIRS}
)
#将第三方库库文件附加到变量Projects_Extra_Libraries中,便于管理
list(APPEND Projects_Extra_Libraries
${SQLITE3_LIBRARIES}
)#设置运行时输出可执行文件目录,非必须
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/bin)
#设置项目包含目录,包括第三方库的头文件
INCLUDE_DIRECTORIES(
${Projects_Extra_Includes}
)
#查找当前文件夹中的所有源代码文件,如果不是所有源码文件都包含,可以通过SET()进行单独设置
FILE(GLOB SRC_FILES "./*.cpp")
#查找设置当前文件夹中所有的头文件
FILE(GLOB HEAD_FILES "./*.h")#创建工程文件
add_executable(${PROJECT_NAME}
${SRC_FILES}
${HEAD_FILES}
)
#添加工程依赖项
target_link_libraries(${PROJECT_NAME}
${Projects_Extra_Libraries}
)