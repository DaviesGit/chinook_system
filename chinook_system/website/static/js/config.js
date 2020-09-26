const NODE_TYPE = {
    Artist: {
        icon: '\uf7a6',

    },
    Album: {
        icon: '\uf07c',

    },
    MediaType: {
        icon: '\uf02f',

    },
    Genre: {
        icon: '\uf786',

    },
    Track: {
        icon: '\uf1c7',

    },
    Playlist: {
        icon: '\uf46d',

    },
    TrackList: {
        icon: '\uf274',

    },
    ListTrack: {
        icon: '\uf0ae',

    },
    Employee: {
        icon: '\uf508',

    },
    Customer: {
        icon: '\uf599',

    },
    Invoice: {
        icon: '\uf570',

    },
    InvoiceLine: {
        icon: '\uf56e',

    },
}
//for (let p in NODE_TYPE) {
//    document.write(`<text class="ico">${p}-${NODE_TYPE[p].icon.replace('\\u','&#x')}||</text>`);
//}

const COLOR = {
    S_FK: 'fill-gray',
    M_FK: 'fill-red',
    _RAND: ['fill-navy', 'fill-blue', 'fill-aqua', 'fill-teal', 'fill-olive', 'fill-green', 'fill-lime', 'fill-yellow', 'fill-orange', 'fill-fuchsia', 'fill-purple', 'fill-maroon', 'fill-black', ],
    RAND: function () {
        return this._RAND[Math.floor(Math.random() * this._RAND.length)]
    },
    get KEY() {
        return this.RAND()
    },
}


var MAX_CHILDREN = 8;
var MAX_TABLE_RECORDS = 200;
