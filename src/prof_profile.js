/**
 * Created by WangZheZen on 2/20/2017.
 */
//var cont = require('continuation');
var request =require("request");
var async =require('async');
var jsonfile = require('jsonfile');
//import mapSeries from 'async/mapSeries';
var request = require('request');
var prof_pic = require('./prof_pic');
var uwaterlooApi=require('uwaterloo-api');
var uwclient = new uwaterlooApi({
    API_KEY : '743887d93f1df944a7acae0f78741746 '
});
var number = 0;
var arr=[];
var mysql= require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'prof_profile'
});

connection.connect();

function extract (arr){
    async.each(arr,exe,done);
}
function doTimeout(i,arr){
    setTimeout(function(){exe(arr[i])},(i)*1000)
}

function extract_1(arr){
    for (var i =0 ; i<arr.length;i++){
        doTimeout(i,arr)
    }

}
function doSetTimeout(i,list_1,course) {
    setTimeout(function() {
        // var arr=[];
        var re_3=/........................................$/g;
        var re_2=/\<\/TD\>\<\/TR\>/g;
        var replace_6=/\s{2,}$/g;
        //var prof ={};
        if(list_1[i].indexOf("LEC")!=-1){
            var prof={};
            var num = list_1[i].match(/LEC \d\d\d/g)[0];
            var section =num.replace(/\D+/g,"");
            //    var section = parseInt(num);
            var text_1 =list_1[i].match(re_3)[0];
            //  var content={};
            var text_2 =text_1.replace(re_2,"");
            var name=text_2.replace(replace_6,"");

            prof.name =name;
            prof.course = course;
            prof.section=section;
         //   console.log(name);
        //    number++;
          //  console.log(number);
           // create_person('uw0003',prof);
            // console.log(name+" "+i);
            //prof_pic.search_prof(prof.name,prof);
            if (name.indexOf("</TD>") == -1) {
               // console.log(prof);
                jsonfile.writeFile('prof_profiles-3.json',prof,{flag: 'a'}, function () {
                    insert_profile(prof.name,prof.course,prof.section);
                    console.log(prof);
                });
            }
            }
           // insert_profile(prof.name,prof.course,prof.section);
            // console.log('gg')
        } , (i+1)*50);
}
function extract_course(course){
    var re_code =/.*\s/g;
    var course_code = course.match(re_code)[0].replace(/\s/g,"");
    var re_number =/\s.*/g;
    var course_number = course.match(re_number)[0].replace(/\s/g,"");
        var options = {

            url: "http://www.adm.uwaterloo.ca/cgi-bin/cgiwrap/infocour/salook.pl?level=under&sess=1171&subject="+course_code+"&cournum="+course_number,
            method: "GET"

        };

        function callback(error, response, body) {
            var re_1 =/\<TR\>.*\<\/TR\>/g;
            if (body){
            var list_1 =body.match(re_1);
           // var arr=[];
            var re_3=/........................................$/g;
            var re_2=/\<\/TD\>\<\/TR\>/g;
            var replace_6=/\s{2,}$/g;
            if (list_1){
            for (var i=0;i<list_1.length;i++){

               // console.log(i);
                doSetTimeout(i,list_1,course);
             //    if(list_1[i].indexOf("LEC")!=-1){
             //        var num = list_1[i].match(/LEC \d\d\d/g)[0];
             //        var section =num.replace(/\D+/g,"");
             //        //    var section = parseInt(num);
             //        var text_1 =list_1[i].match(re_3)[0];
             //        //  var content={};
             //        var text_2 =text_1.replace(re_2,"");
             //        var name=text_2.replace(replace_6,"");
             //        prof.name =name;
             //        prof.course = course;
             //        prof.section=section;
             //        console.log(prof);}
                }

           // console.log(list_1);
           // console.log(arr.length);
         //   return arr;

        }}
        else {
                console.log(course+"is not available");
            }
        }



    request(options, callback);
}



function exe (item) {
        //  console.log(item);
    number++;
    //console.log(number);
          setTimeout(function (){extract_course(item)},number * 1000);
        //   i++;



       }
//console.log(arr);
function done(results) {
    //console.log(results);
    //console.log('gg');

}
    function group_extract (array){
        for (var i =0; i<array.length;i++){
            extract_course(array[i]);

        }}
function list_course() {
    uwclient.get('/courses', function (err, res) {
        if (!err) {
            //  console.log('gg');

            extract(sort_courses(res.data));
        }
    });
}
    function sort_courses (list){
        var arr=[];
        for (var i =0;i<list.length;i++){
            //console.log(number);
            //number++;
            arr.push(list[i].subject+" "+list[i].catalog_number);
        }
        return arr;
    }
    function sort_subject (list){
        var arr=[];
        for (var i=0;i<list.length;i++){
            arr.push(list[i].subject);
        }
        return arr.join("\n");
    }
  //  group_extract(["CS 136","MATH 138"]);
function insert_profile (name,course,section){
    connection.query('insert into prof_profiles(name,course,section) values('+'"'+name+'"'+','+'"'+course+'"'+','+'"'+section+'"'+')', function (error, results, fields) {
        if(results) console.log(results);
        else console.log(error);
    });

}
function update_person_id(name,course,section,id){
    connection.query('update profiles set person_id = '+'"'+id+'"'+'where name ='+'"'+name+'"'+'&& course ='+'"'+course+'"'+'&& section ='+'"'+section+'"', function (error, results, fields) {
        if(results) console.log(results)

    })}
function  create_person (group_id,content) {
    var options ={
        url:"https://westus.api.cognitive.microsoft.com/face/v1.0/persongroups/"+group_id+"/persons",
        headers:{"Ocp-Apim-Subscription-Key":"a9c4373a10ec4e17a1c71e3fa84f7506"},
        method:"post",
        body: JSON.stringify({
            "name":content.name,
            "userData":JSON.stringify(content.course)+" "+JSON.stringify(content.section)
        })
    };
    function callback(error, response, body) {
        //console.log('gg')
        if (!error && response.statusCode == 200) {

            console.log(body);
            update_person_id(content.name,content.course,content.section,JSON.parse(body).personId);
        }

        else {
            console.log(body);
            console.log(response);
        }
    }
    request(options, callback);}
 list_course();
