layui.use(['jquery'], function () {
    layui.$.ajax({
        url:'query',
        method:'post',
        data:{
            sql:'select * from Track;',
        },
        success:function(data){
            console.log(data);
        },
        error:function(xhr, status, error){
            console.log(error);
        },
    });
});
