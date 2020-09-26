const T = {
    PK: 1 << 0, //主键
    KEY: 1 << 1, //普通字段
    S_FK: 1 << 2, //一对一外键
    M_FK: 1 << 3, //一对多外键
    D_KEY: 1 << 4, //简略展示字段 ,定义会在节点上展示的字段
}

const database = { //数据库信息用来创建SQL查询语句。
    Artist: {
        column: ['ArtistId', 'Name'],
        column_name: ['ID', '名称', '专辑'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, null, 'Album'],
    },
    Album: {
        column: ['AlbumId', 'Title', 'ArtistId'],
        column_name: ['ID', '标题', '艺术家', '音乐'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.S_FK, T.M_FK],
        FK_table: [null, null, 'Artist', 'Track'],
    },
    MediaType: {
        column: ['MediaTypeId', 'Name'],
        column_name: ['ID', '文件编码', '音乐'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, null, 'Track'],
    },
    Genre: {
        column: ['GenreId', 'Name'],
        column_name: ['ID', '艺术体裁', '音乐'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, null, 'Track'],
    },
    Track: {
        column: ['TrackId', 'Name', 'AlbumId', 'MediaTypeId', 'GenreId', 'Composer', 'Milliseconds', 'Bytes', 'UnitPrice'],
        sql_fun: [, , , , , , d => `strftime('%M:%S',${d}/1000,'unixepoch')`, d => `printf('%,d kB',${d}/1024)`, d => `'$'||${d}`],
        column_name: ['ID', '歌曲名称', '专辑', '文件编码', '艺术体裁', '作曲家', '时长', '大小', '价格', '播放列表', '发票记录'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.S_FK, T.S_FK, T.S_FK, T.KEY, T.KEY, T.KEY, T.KEY, T.M_FK, T.M_FK],
        FK_table: [null, null, 'Album', 'MediaType', 'Genre', null, null, null, null, 'TrackList', 'InvoiceLine'],
    },
    Playlist: {
        column: ['PlaylistId', 'Name'],
        column_name: ['ID', '歌单', '音乐列表'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, null, 'ListTrack'],
    },
    TrackList: {
        column: ['TrackId', 'PlaylistId', 'Name'],
        column_name: ['音乐ID', '歌单ID', '歌单', '音乐列表'],
        column_type: [T.KEY, T.PK, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, null, null, 'ListTrack'],
    },
    ListTrack: {
        column: ['PlaylistId', 'TrackId', 'Name', 'AlbumId', 'MediaTypeId', 'GenreId', 'Composer', 'Milliseconds', 'Bytes', 'UnitPrice'],
        sql_fun: [, , , , , , , d => `strftime('%M:%S',${d}/1000,'unixepoch')`, d => `printf('%,d kB',${d}/1024)`, d => `'$'||${d}`],
        column_name: ['歌单ID', '音乐ID', '歌曲名称', '专辑', '文件编码', '艺术体裁', '作曲家', '时长', '大小', '价格', '播放列表', '发票记录'],
        column_type: [T.KEY, T.PK, T.KEY | T.D_KEY, T.S_FK, T.S_FK, T.S_FK, T.KEY, T.KEY, T.KEY, T.KEY, T.M_FK, T.M_FK],
        FK_table: [null, null, null, 'Album', 'MediaType', 'Genre', null, null, null, null, 'TrackList', 'InvoiceLine'],
    },
    Employee: {
        column: ['EmployeeId', 'LastName', 'FirstName', 'Title', 'ReportsTo', 'BirthDate', 'HireDate', 'Address', 'City', 'State', 'Country', 'PostalCode', 'Phone', 'Fax', 'Email'],
        column_name: ['ID', '姓', '名', '职称', '直属上级', '生日', '入职时间', '详细地址', '城市', '州', '国家', '邮政编码', '电话', '传真', '邮箱', '直属下级', '客户'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.KEY | T.D_KEY, T.KEY, T.S_FK, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.M_FK, T.M_FK],
        FK_table: [null, null, null, null, 'Employee', null, null, null, null, null, null, null, null, null, null, 'Employee', 'Customer'],
    },
    Customer: {
        column: ['CustomerId', 'FirstName', 'LastName', 'Company', 'Address', 'City', 'State', 'Country', 'PostalCode', 'Phone', 'Fax', 'Email', 'SupportRepId'],
        column_name: ['ID', '姓', '名', '公司', '详细地址', '城市', '州', '国家', '邮政编码', '电话', '传真', '邮箱', '客户经理', '发票'],
        column_type: [T.PK, T.KEY | T.D_KEY, T.KEY | T.D_KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.S_FK, T.M_FK],
        FK_table: [null, null, null, null, null, null, null, null, null, null, null, null, 'Employee', 'Invoice'],
    },
    Invoice: {
        column: ['InvoiceId', 'CustomerId', 'InvoiceDate', 'BillingAddress', 'BillingCity', 'BillingState', 'BillingCountry', 'BillingPostalCode', 'Total'],
        sql_fun: [, , , , , , , , d => `'$'||${d}`],
        column_name: ['ID', '客户', '发票日期', '发票地址', '城市', '州', '国家', '邮政编码', '总金额', '发票记录'],
        column_type: [T.PK, T.S_FK, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY, T.KEY | T.D_KEY, T.M_FK],
        FK_table: [null, 'Customer', null, null, null, null, null, null, null, 'InvoiceLine'],
    },
    InvoiceLine: {
        column: ['InvoiceLineId', 'InvoiceId', 'TrackId', 'UnitPrice', 'Quantity'],
        sql_fun: [, , , d => `'$'||${d}`, ],
        column_name: ['ID', '发票', '音乐', '单价', '数量'],
        column_type: [T.PK, T.S_FK, T.S_FK, T.KEY | T.D_KEY, T.KEY | T.D_KEY],
        FK_table: [null, 'Invoice', 'Track', null, null],
    },
};


function build_SQL(TABLE, WHERE) {
    let db = database[TABLE];
    let COL = db.column.map(function (ele, i) {
        return `${db.sql_fun&&db.sql_fun[i]?db.sql_fun[i](db.column[i]):db.column[i]} AS ${db.column_name[i]}`;
    }).join(',');
    let sql = `SELECT ${COL} FROM ${TABLE}${WHERE?' WHERE ':''}${WHERE?WHERE:''};`;
    return sql;
}
//for (let p in database) {
//    console.log(build_SQL(p, database[p].column[0] + '=1'));
//}

function get_col_idx(TABLE, type) {
    let idx = [];
    database[TABLE].column_type.forEach(function (e, i) {
        if (type & e)
            idx.push(i);
    });
    return idx;
}

function get_col_info(TABLE, type) {
    let info = [];
    let idx = get_col_idx(TABLE, type);
    let col = [];
    let name = [];
    let table = [];
    info.push(idx);
    info.push(col);
    info.push(name);
    info.push(table);
    idx.forEach((e) => {
        col.push(database[TABLE].column[e]);
        name.push(database[TABLE].column_name[e]);
        table.push(database[TABLE].FK_table[e]);
    });
    return info;
}

function get_col_data(TABLE, data, type) {
    let idx = get_col_idx(TABLE, type);
    let col_data = [];
    for (let i = 1; i < data.length; ++i) {
        let dd = [];
        idx.forEach((e) => {
            dd.push(data[i][e]);
        });
        col_data.push(dd);
    }
    return col_data;
}

//for (let p in database) {
//    console.log(get_col_idx(p, T.M_FK));
//}
function get_display_name(TABLE, data) {
    let names = get_col_data(TABLE, data, T.D_KEY);
    return names.map(d => d.join(','));
}



function query(sql, callback) {
    layui.use(['jquery'], function () {
        layui.$.ajax({
            url: 'query',
            method: 'post',
            data: {
                sql: sql,
            },
            success: function (data) {
                callback(data);
            },
            error: function (xhr, status, error) {
                console.log(error);
                callback(error);
            },
        });
    });
}

//
//for (let p in database) {
//    query(build_SQL(p),console.log);
//}
