const next_id = (function () {
    let id = 0;
    return function next_id() {
        return id++;
    }
})();

function add_id(root) {
    root.descendants().forEach((d, i) => {
        d.id = next_id();
    });
    return root;
}

function hierarchy_insert(data, parent) {
    if (!parent)
        return add_id(d3.hierarchy(data));
    let new_node = d3.hierarchy(data);
    new_node.depth = parent.depth + 1;
    new_node.parent = parent;
    // Walk up the tree, updating the heights of ancestors as needed.
    for (let height = new_node.height + 1, anc = parent; anc != null; height++, anc = anc.parent) {
        anc.height = Math.max(anc.height, height);
    }
    if (!parent.data.children) {
        parent.children = [];
        parent.data.children = [];
    }
    parent.children.push(new_node);
    parent.data.children.push(new_node.data);
    new_node.x = parent.x;
    new_node.y = parent.y;
    return add_id(new_node);
}

function hierarchy_remove(node) {
    node.height = 0;
    parent = node;
    node.children = node.data.children = null;
    while (parent = parent.parent) {
        parent.height = 1 + parent.children.reduce(function (accumulator, currentValue) {
            if (currentValue.height > accumulator) accumulator = currentValue.height;
            return accumulator;
        }, 0);
    }
    return node;
}

const simulation = (function gen_simulation() {
    let root = null;
    let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-5));
    let link_group = null;
    let node_group = null;
    let on_drag = (simulation => {
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    })(simulation);

    let link = d3.select(),
        node = link;
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

    });

    function set_group(_link_group, _node_group) {
        link_group = _link_group;
        node_group = _node_group;
        link_group.attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);
        return this;
    }

    function dblclick(node, i) {
        d3.event.bubbles = false;
        if (d3.event.target.tagName == "circle") {
            d3.event.stopPropagation();
        }
        if (node.children) {
            hierarchy_remove(node);
            return update(root);
        }
        let sql = build_SQL(node.data.type, node.data.WHERE);
        query(sql, function (data) {
            set_result_table(sql, data);
            if (!(data instanceof Array))
                return msg_err('执行错误: ' + data);
            if (data.length < 2)
                return msg_inf('空数据！');
            let info;
            let PK;
            switch (node.data.node_type) {
                case 'M_FK':
                    if (data.length > MAX_CHILDREN + 1) {
                        msg_inf('原始数据长度：' + (data.length - 1) + '。已截断！');
                        data = data.slice(0, MAX_CHILDREN + 1);
                    }
                    let names = get_display_name(node.data.type, data);
                    let ids = get_col_data(node.data.type, data, T.PK);
                    PK = get_col_info(node.data.type, T.PK)[1][0];
                    names.forEach((e, i) => {
                        let child = {
                            name: e,
                            type: node.data.type,
                            node_type: 'KEY',
                            size: 'md',
                            WHERE: `${PK}=${ids[i]}`,
                        };
                        hierarchy_insert(child, node);
                    });
                    break;
                case 'KEY':
                    info = get_col_info(node.data.type, T.S_FK);
                    info[0].forEach((e, i) => {
                        let child = {
                            name: info[2][i],
                            type: info[3][i],
                            node_type: 'S_FK',
                            size: 'sm',
                            WHERE: `${get_col_info(info[3][i], T.PK)[1][0]}=${data[1][info[0][i]]}`,
                        };
                        hierarchy_insert(child, node);
                    });
                    info = get_col_info(node.data.type, T.M_FK);
                    PK = get_col_info(node.data.type, T.PK);
                    info[0].forEach((e, i) => {
                        let child = {
                            name: info[2][i],
                            type: info[3][i],
                            node_type: 'M_FK',
                            size: 'lg',
                            WHERE: `${'Employee'===info[3][i]?'ReportsTo':'Customer'===info[3][i]?'SupportRepId':PK[1][0]}=${data[1][PK[0][0]]}`, //特殊处理
                        };
                        hierarchy_insert(child, node);
                    });
                    break;
                case 'S_FK':
                    let child = {
                        name: get_display_name(node.data.type, data)[0],
                        type: node.data.type,
                        node_type: 'KEY',
                        size: 'md',
                        WHERE: node.data.WHERE,
                    };
                    hierarchy_insert(child, node);
                    break;
            }
            return update(root);
        });
    }

    function mouseover(node, i) {
        sql_string.innerText = build_SQL(node.data.type, node.data.WHERE);
    }

    function update(_root) {
        root = _root;
        let links = root.links();
        let nodes = root.descendants();

        simulation
            .force("link", d3.forceLink(links).id(d => d.id).distance((l, i) => {
                let parent, child;
                if (l.target.parent === l.source) {
                    parent = l.source;
                    child = l.target;
                } else {
                    parent = l.target;
                    child = l.source;
                }
                switch (parent.data.node_type) {
                    case "M_FK":
                        return 10;
                    case "S_FK":
                        return 8;
                    case "KEY":
                        switch (child.data.node_type) {
                            case "M_FK":
                                return 50;
                            case "S_FK":
                                return 6;
                        }
                }
            }).strength((l, i) => {
                let parent, child;
                if (l.target.parent === l.source) {
                    parent = l.source;
                    child = l.target;
                } else {
                    parent = l.target;
                    child = l.source;
                }
                switch (parent.data.node_type) {
                    case "M_FK":
                        return 1;
                    case "S_FK":
                        return 5;
                    case "KEY":
                        return 3;
                }
            }))
            .force('collision', d3.forceCollide().radius(function (d) {
                switch (d.data.size) {
                    case 'lg':
                        return 12;
                    case 'md':
                        return 10;
                    case 'sm':
                        return 8;
                }
            }))
            .nodes(nodes)
            .alphaTarget(0)
            .restart();

        let old_link = link_group.selectAll("line")
            .data(links, d => d.id);
        let new_link = old_link.enter().append("line");
        old_link.exit().remove();
        link = old_link.merge(new_link);

        let old_node = node_group.selectAll("g")
            .data(nodes, d => d.id);
        let new_node = old_node.enter().append("g")
            .attr("class", d => `node ${d.data.size}`)
            .call(on_drag)
            .on('dblclick', dblclick)
            .on('mouseover', mouseover);
        old_node.exit().remove();
        node = old_node.merge(new_node);
        new_node.append("title")
            .text(d => d.data.name);

        new_node.append("circle")

        new_node.append("text")
            .attr("class", d => `ico ${COLOR[d.data.node_type]}`)
            .text(d => NODE_TYPE[d.data.type].icon);

        new_node.append("text")
            .attr("class", "info back")
            .text(d => d.data.name);
        new_node.append("text")
            .attr("class", "info")
            .text(d => d.data.name);

        return this;
    }

    return {
        simulation: simulation,
        set_group: set_group,
        update: update,
    }
})();

function adjust_viewBox() {
    let width = tree.clientWidth / 2;
    let height = tree.clientHeight / 2;
    d3.select("#tree>svg").attr("viewBox", [-width / 2, -height / 2, width, height]);
}

let svg = d3.select("#tree").append("svg");
let group = svg.append("g");
let link_group = group.append("g");
let node_group = group.append("g");
let zoom = d3.zoom()
    .scaleExtent([0.05, 5])
    .on("zoom", function () {
        group.attr("transform", d3.event.transform);
    });
svg.call(zoom).on("dblclick.zoom", null);


layui.use(['jquery'], function () {

    simulation.set_group(link_group, node_group);

    adjust_viewBox();
    layui.$(tree).resize(adjust_viewBox);
    layui.$('.node_set>dd').click(function () {
        let ele = layui.$('a', this);
        let data = {
            name: ele.data('name'),
            type: ele.data('type'),
            node_type: 'M_FK',
            size: 'lg',
            WHERE: '',
        };
        svg.transition()
            .duration(300)
            .call(zoom.transform, d3.zoomIdentity);
        let root = hierarchy_insert(data);
        simulation.update(root);
    });
    layui.$('.settings>dd').click(function () {
        let ele = layui.$('a', this);
        let variable = ele.data('variable');
        let name = ele.data('name');
        if (!variable || !name) return;
        layer.prompt({
            value: window[variable],
            title: '设置' + name,
        }, function (value, index, elem) {
            window[variable] = +value;
            layer.close(index);
            msg_inf(name + ' 设置为：' + value);
        });
    });
});




//invalidation.then(() => simulation.stop());
