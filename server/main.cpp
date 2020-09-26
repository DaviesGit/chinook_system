
#include <chrono>
#include <cstdio>
#include <iostream>
#include <vector>
#include <sqlite3.h>
#include <ctime>
#include <iomanip>
#include "cpp-httplib-0.6.5/httplib.h"

#define SQL "sql"
#define DATABASE_FILE "Chinook_Sqlite.sqlite"
#define STATIC_FILE_PATH "website"

using namespace httplib;

void inline log_time(std::ostream &os)
{
    auto t = std::time(nullptr);
    auto tm = *std::localtime(&t);
    os << std::put_time(&tm, "%Y-%m-%d %H-%M-%S") << " ";
}

// void log_err(char const *const msg)
// {
//     log_time(std::cerr);
//     std::cerr << "Err: " << msg << std::endl;
// }
// void log_info(char const *const msg)
// {
//     log_time(std::cout);
//     std::cout << "Inf: " << msg << std::endl;
// }

template <class... Types>
void log_err(Types... args)
{
    log_time(std::cout);
    std::cerr << "Err: ";
    int dummy[sizeof...(Types)] = {(std::cout << args, 0)...};
    std::cerr << std::endl;
}
template <class... Types>
void log_info(Types... args)
{
    log_time(std::cout);
    std::cout << "Inf: ";
    int dummy[sizeof...(Types)] = {(std::cout << args, 0)...};
    std::cout << std::endl;
}

std::string &ReplaceStringInPlace(std::string &subject, const std::string &search,
                                  const std::string &replace)
{
    size_t pos = 0;
    while ((pos = subject.find(search, pos)) != std::string::npos)
    {
        subject.replace(pos, search.length(), replace);
        pos += replace.length();
    }
    return subject;
}

std::string &dump_string_vector(std::string &json, std::vector<std::string> &vec)
{
    json += "[";
    for (std::vector<std::string>::iterator it = vec.begin(), end = vec.end(); it != end;)
    {
        std::string str = *it;
        json += "\"";
        ReplaceStringInPlace(str, "\\", "\\\\");
        json += ReplaceStringInPlace(str, "\"", "\\\"");
        json += "\"";
        if (end != ++it)
            json += ",";
    }
    json += "]";
}

class QueryResult
{
public:
    int has_error;
    int has_set_header;
    int col_count;
    int record_count;
    std::string error_msg;
    std::vector<std::string> header;
    std::vector<std::vector<std::string>> records;
    QueryResult() : has_error(0), has_set_header(0)
    {
    }
    ~QueryResult()
    {
    }
    void set_header(int argc, char **azColName)
    {
        col_count = argc;
        for (int i = 0; i < col_count; ++i)
            header.push_back(azColName[i]);
        has_set_header = 1;
    }
    void set_record(char **argv)
    {
        std::vector<std::string> _record;
        records.push_back(_record);
        std::vector<std::string> &record = records.back();
        for (int i = 0; i < col_count; ++i){
            record.push_back(argv[i] ? argv[i] : "");
        }
        ++record_count;
    }
    std::string &dump_json(std::string &json)
    {
        json += "[";
        dump_string_vector(json, header);

        for (std::vector<std::vector<std::string>>::iterator it = records.begin(), end = records.end(); it != end; ++it)
        {
            json += ",";
            dump_string_vector(json, *it);
        }
        json += "]";
        return json;
    }
};

int query_callback(void *data, int argc, char **argv, char **azColName);

int query(sqlite3 *db, QueryResult *query_result, char const *sql);

std::string dump_headers(const Headers &headers)
{
    std::string s;
    char buf[BUFSIZ];

    for (auto it = headers.begin(); it != headers.end(); ++it)
    {
        const auto &x = *it;
        snprintf(buf, sizeof(buf), "%s: %s\n", x.first.c_str(), x.second.c_str());
        s += buf;
    }

    return s;
}

std::string log(const Request &req, const Response &res)
{
    std::string s;
    char buf[BUFSIZ];

    s += "================================\n";

    snprintf(buf, sizeof(buf), "%s %s %s", req.method.c_str(),
             req.version.c_str(), req.path.c_str());
    s += buf;

    std::string query;
    for (auto it = req.params.begin(); it != req.params.end(); ++it)
    {
        const auto &x = *it;
        snprintf(buf, sizeof(buf), "%c%s=%s",
                 (it == req.params.begin()) ? '?' : '&', x.first.c_str(),
                 x.second.c_str());
        query += buf;
    }
    snprintf(buf, sizeof(buf), "%s\n", query.c_str());
    s += buf;

    s += dump_headers(req.headers);

    s += "--------------------------------\n";

    snprintf(buf, sizeof(buf), "%d %s\n", res.status, res.version.c_str());
    s += buf;
    s += dump_headers(res.headers);
    s += "\n";

    if (!res.body.empty())
    {
        s += res.body;
    }

    s += "\n";

    return s;
}

int main(int argc, char *argv[])
{
    int server_port = 8080;
    if (argc > 1)
    {
        server_port = std::stoi(argv[1]);
    }

    sqlite3 *db;
    if (SQLITE_OK != sqlite3_open_v2(DATABASE_FILE, &db, SQLITE_OPEN_READONLY, NULL))
    {
        std::cerr << "Can't open database: " << sqlite3_errmsg(db) << std::endl;
        return 1;
    }
    log_info("Open database successfully!");

    Server svr;

    if (!svr.is_valid())
    {
        log_err("server has an error...");
        return -1;
    }
    if (!svr.set_mount_point("/chinook", STATIC_FILE_PATH))
    {
        log_err("Cannot mount static file!");
        return -1;
    }

    svr.Get("/", [=](const Request & /*req*/, Response &res) {
        res.set_redirect("/chinook/");
    });

    svr.Get("/chinook", [](const Request & /*req*/, Response &res) {
        res.set_content("Hello World!\n", "text/plain");
    });

    svr.Post("/chinook/query", [db](const Request &req, Response &res) {
        if (!req.has_param(SQL))
        {
            log_err("Request /query must have sql parameter!");
            res.set_content("Request /query must have sql parameter!\n", "text/plain");
            return;
        }
        std::string sql = req.get_param_value(SQL);

        log_info("执行 SQL: ", sql);
        QueryResult query_result;
        if (!query(db, &query_result, sql.c_str()))
        {
            log_err(query_result.error_msg);
            res.set_content(query_result.error_msg.c_str(), "text/plain");
            return;
        }
        log_info("执行成功!");
        std::string json;
        query_result.dump_json(json);
        res.set_content(json.c_str(), "application/json");
    });

    svr.Get("/dump", [](const Request &req, Response &res) {
        res.set_content(dump_headers(req.headers), "text/plain");
    });

    svr.Get("/stop",
            [&](const Request & /*req*/, Response & /*res*/) { svr.stop(); });

    svr.set_error_handler([](const Request & /*req*/, Response &res) {
        const char *fmt = "<p>Error Status: <span style='color:red;'>%d</span></p><h2>Powered by <a href=\"https://github.com/DaviesGit\">Davies</a></h2>";
        char buf[BUFSIZ];
        snprintf(buf, sizeof(buf), fmt, res.status);
        res.set_content(buf, "text/html");
    });

    svr.set_logger([](const Request &req, const Response &res) {
        // printf("%s", log(req, res).c_str());
    });
    log_info("服务成功启动!");
    log_info("请访问: http://localhost:", server_port, " 查看。");
    svr.listen("0.0.0.0", server_port);
    sqlite3_close(db);
    log_info("服务已停止!");
    return 0;
}

int query_callback(void *data, int argc, char **argv, char **azColName)
{
    QueryResult *query_result = (QueryResult *)data;
    if (!query_result->has_set_header)
        query_result->set_header(argc, azColName);

    query_result->set_record(argv);
    std::string json;
    return 0;
}

int query(sqlite3 *db, QueryResult *query_result, char const *sql)
{
    char *zErrMsg = NULL;
    if (SQLITE_OK != sqlite3_exec(db, sql, query_callback, query_result, &zErrMsg))
    {
        query_result->has_error = 1;
        query_result->error_msg = zErrMsg;
        return 0;
    }
    return 1;
}
