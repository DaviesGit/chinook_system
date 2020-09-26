function init() {
    let is_result_table_open = false;

    let init_table = () => layui.table.reload('result_table');

    layui.table.render({
        elem: '#result_table',
        //        cellMinWidth: 80,
        cols: [[
            {
                field: 'info',
                title: '信息',
                sort: true,
            }, ,
        ]],
        data: [{
            info: '启动成功！',
        }],
    });

    function open_result_table() {
        if (is_result_table_open) {
            return msg_inf("结果表已经打开！");
        }
        layui.layer.open({
            type: 1 //此处以iframe举例
                ,
            title: 'SQL结果',
            area: ['420px', '320px'],
            shade: 0,
            maxmin: true,
            offset: 'lb',
            content: layui.$(sql_result),
            //            zIndex: layer.zIndex, //重点1
            success: function (layero) {
                //                layer.setTop(layero);
                init_table();
                is_result_table_open = true;
            },
            resizing: init_table,
            full: init_table,
            min: init_table,
            restore: init_table,
            cancel: function (index, layero) {
                is_result_table_open = false;
                msg_inf("已关闭，你可以通过导航<br>栏的结果表再次打开！");
            }
        });
    }

    layui.$(button_readme).click(() => {
        layer.open({
            type: 2,
            title: '说明',
            area: ['80%', '90%'],
            shade: 0,
            maxmin: true,
            content: 'intro.pdf',
            success: function (layero) {
//                layer.setTop(layero); //重点2
            }
        });
    });

    layui.$(button_result_table).click(open_result_table);
    setTimeout(open_result_table, 100);
    layui.form.on('submit(sql_exec)', function () {
        let sql = sql_input.value;
        query_and_show(sql);
        return false;
    });

    layui.$(button_copy_sql).click(() => {
        copyTextToClipboard(sql_string.innerText);
        msg_inf('已复制到剪切板！');
    });

    layui.$('dd', question_left).add('dd', question_top).click(function () {
        let ele = layui.$('a', this);
        let sql = ele.data('sql');
        query_and_show(sql);
    });
}

function query_and_show(sql) {
    query(sql, function (data) {
        msg_inf("执行完成！");
        set_result_table(sql, data);
    });
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a
    // flash, so some of these are just precautions. However in
    // Internet Explorer the element is visible whilst the popup
    // box asking the user for permission for the web page to
    // copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}


function set_result_table(sql, data) {
    sql_input.value = sql;
    if (!(data instanceof Array))
        data = [['错误信息'], [data]];
    if (2 > data.length)
        data = [['信息'], ['空结果！']];
    if (2 === data.length) {
        data = data[0].map((d, i) => {
            return [d, data[1][i]];
        });
        data.unshift(['属性', '值']);
    }
    set_table_data(data);
}


function set_table_data(_data) {
    let cols = [[]];
    let data = [];
    _data[0].forEach((d, i) => {
        cols[0].push({
            field: d,
            title: d,
            //            sort: true,
        });
    });
    for (let i = 1; i < _data.length; ++i) {
        data[i - 1] = {};
        _data[0].forEach((d, j) => {
            data[i - 1][d] = _data[i][j];
        });
    }
    layui.table.reload('result_table', {
        cols: cols,
        data: data,
        limit: MAX_TABLE_RECORDS,
    });
}


function msg_inf(msg) {
    layui.layer.msg(msg, {
        offset: 'rb',
        icon: 6,
    });
}

function msg_err(msg) {
    layui.layer.msg(msg, {
        offset: 'rb',
        icon: 5,
    });
}



layui.use(['layer', 'element', 'jquery', 'table'], function () {
    init();
});
